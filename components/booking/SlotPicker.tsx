'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { useAvailableSlots, type Slot } from '@/hooks/useSlots';
import { 
  format, 
  parseISO, 
  startOfWeek, 
  endOfWeek, 
  startOfDay,
  addDays,
  isSameDay,
  isAfter,
  isBefore,
  isWithinInterval,
  addWeeks,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
} from 'date-fns';
import { X, Calendar } from 'lucide-react';

interface SlotPickerProps {
  experienceSlug: string;
  onSlotSelected: (
    slotId: number,
    date: string,
    time: string,
    pricePerPerson: number,
    available?: number
  ) => void;
}

type QuickFilter = 'this-week' | 'this-weekend' | 'custom';

export function SlotPicker({
  experienceSlug,
  onSlotSelected,
}: SlotPickerProps) {
  const { slots, loading, error } = useAvailableSlots(experienceSlug);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<QuickFilter | null>(null);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const timeSectionRef = useRef<HTMLDivElement>(null);

  // Normalizar clave de fecha a yyyy-MM-dd (Postgres puede devolver ISO con hora)
  const toDateKey = (d: string) =>
    typeof d === 'string' && d.length >= 10 ? d.slice(0, 10) : d;

  const slotsByDate = useMemo(() => {
    const grouped = new Map<string, Slot[]>();
    slots.forEach((slot) => {
      const dateKey = toDateKey(slot.date);
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }
      grouped.get(dateKey)!.push(slot);
    });
    return grouped;
  }, [slots]);

  const availableDates = Array.from(slotsByDate.keys())
    .map(date => parseISO(date))
    .sort((a, b) => a.getTime() - b.getTime())
    .map(date => format(date, 'yyyy-MM-dd'));

  const timesForSelectedDate = selectedDate
    ? slotsByDate.get(selectedDate) ?? []
    : [];

  // Calcular filtros rápidos
  const today = startOfDay(new Date());
  const dayOfWeek = getDay(today); // 0 = domingo, 1 = lunes, etc.

  // "Esta semana" - hasta domingo si hoy es lunes-jueves
  const thisWeekDates = useMemo(() => {
    if (dayOfWeek >= 1 && dayOfWeek <= 4) { // Lunes a Jueves
      const weekEnd = endOfWeek(today, { weekStartsOn: 1 }); // Domingo de esta semana
      return availableDates.filter(date => {
        const dateObj = parseISO(date);
        return !isBefore(dateObj, today) && !isAfter(dateObj, weekEnd);
      });
    }
    return [];
  }, [availableDates, today, dayOfWeek]);

  // "Este fin de semana" - si hoy es jueves-domingo
  // Fin de semana = Sábado y Domingo
  const thisWeekendDates = useMemo(() => {
    if (dayOfWeek >= 4 || dayOfWeek === 0) { // Jueves a Domingo
      let saturday: Date;
      let sunday: Date;
      
      if (dayOfWeek === 4) { // Jueves - próximo fin de semana (sábado-domingo)
        saturday = addDays(today, 2); // Sábado
        sunday = addDays(today, 3); // Domingo
      } else if (dayOfWeek === 5) { // Viernes - próximo fin de semana
        saturday = addDays(today, 1); // Sábado
        sunday = addDays(today, 2); // Domingo
      } else if (dayOfWeek === 6) { // Sábado - este fin de semana
        saturday = today;
        sunday = addDays(today, 1); // Domingo
      } else { // Domingo (0) - próximo fin de semana
        saturday = addDays(today, 6); // Próximo sábado
        sunday = addDays(today, 7); // Próximo domingo
      }

      return availableDates.filter(date => {
        const dateObj = parseISO(date);
        return isWithinInterval(dateObj, {
          start: saturday,
          end: sunday,
        });
      });
    }
    return [];
  }, [availableDates, today, dayOfWeek]);

  // Filtrar fechas según el filtro activo
  const filteredDates = useMemo(() => {
    if (!activeFilter) return [];
    
    switch (activeFilter) {
      case 'this-week':
        return thisWeekDates;
      case 'this-weekend':
        return thisWeekendDates;
      default:
        return [];
    }
  }, [activeFilter, thisWeekDates, thisWeekendDates]);

  const handleDateSelect = (date: string) => {
    const dateKey = toDateKey(date);
    setSelectedDate(dateKey);
    setSelectedTime(null);
    setShowCalendarModal(false);
  };

  // Hacer scroll a la sección de horarios cuando el usuario elige una fecha
  useEffect(() => {
    if (selectedDate && timesForSelectedDate.length > 0 && timeSectionRef.current) {
      timeSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [selectedDate, timesForSelectedDate.length]);

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    const selectedSlot = timesForSelectedDate.find((s) => s.time === time);
    if (selectedSlot) {
      onSlotSelected(
        selectedSlot.id,
        selectedSlot.date,
        selectedSlot.time,
        Number(selectedSlot.price_per_person),
        selectedSlot.available
      );
    }
  };

  // Calendario modal
  const monthStart = startOfMonth(calendarMonth);
  const monthEnd = endOfMonth(calendarMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Encontrar meses con slots disponibles
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    availableDates.forEach(date => {
      const monthKey = date.substring(0, 7); // yyyy-MM
      months.add(monthKey);
    });
    return Array.from(months).sort();
  }, [availableDates]);

  const nextMonth = () => {
    const currentMonthKey = format(calendarMonth, 'yyyy-MM');
    const currentIndex = availableMonths.indexOf(currentMonthKey);
    if (currentIndex < availableMonths.length - 1) {
      setCalendarMonth(parseISO(`${availableMonths[currentIndex + 1]}-01`));
    }
  };

  const prevMonth = () => {
    const currentMonthKey = format(calendarMonth, 'yyyy-MM');
    const currentIndex = availableMonths.indexOf(currentMonthKey);
    if (currentIndex > 0) {
      setCalendarMonth(parseISO(`${availableMonths[currentIndex - 1]}-01`));
    }
  };

  // Inicializar calendario al primer mes disponible cuando se abre el modal
  const handleOpenCalendar = () => {
    if (availableMonths.length > 0) {
      setCalendarMonth(parseISO(`${availableMonths[0]}-01`));
    }
    setShowCalendarModal(true);
    setActiveFilter('custom');
  };

  if (loading) {
    return (
      <div className="py-8 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-brand border-r-transparent" />
        <p className="mt-4 text-sm uppercase tracking-widest text-dark/60">
          Loading available dates...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-dark/10 bg-cream p-6">
        <p className="text-sm text-dark/60">
          Unable to load available dates. Please try again later.
        </p>
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="rounded-lg border border-dark/10 bg-cream p-6">
        <p className="text-sm text-dark/60">
          No dates currently available for booking.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros Rápidos */}
      <div>
        <h3 className="mb-3 font-serif text-xl text-dark">Select Date</h3>
        <div className="flex flex-wrap gap-3">
          {thisWeekDates.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setActiveFilter('this-week');
                setSelectedDate(null);
                setSelectedTime(null);
              }}
              className={`px-6 py-3 rounded-lg border-2 transition-all font-medium ${
                activeFilter === 'this-week'
                  ? 'border-brand bg-brand text-white'
                  : 'border-dark/10 bg-white hover:border-brand/30'
              }`}
            >
              This Week ({thisWeekDates.length})
            </button>
          )}
          
          {thisWeekendDates.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setActiveFilter('this-weekend');
                setSelectedDate(null);
                setSelectedTime(null);
              }}
              className={`px-6 py-3 rounded-lg border-2 transition-all font-medium ${
                activeFilter === 'this-weekend'
                  ? 'border-brand bg-brand text-white'
                  : 'border-dark/10 bg-white hover:border-brand/30'
              }`}
            >
              This Weekend ({thisWeekendDates.length})
            </button>
          )}
          
          <button
            type="button"
            onClick={handleOpenCalendar}
            className={`px-6 py-3 rounded-lg border-2 transition-all font-medium flex items-center gap-2 ${
              activeFilter === 'custom'
                ? 'border-brand bg-brand text-white'
                : 'border-dark/10 bg-white hover:border-brand/30'
            }`}
          >
            <Calendar size={16} />
            Custom Date
          </button>
        </div>
      </div>

      {/* Fechas filtradas */}
      {activeFilter && filteredDates.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-widest text-gray-400 mb-3">
            {activeFilter === 'this-week' && 'Available this week'}
            {activeFilter === 'this-weekend' && 'Available this weekend'}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {filteredDates.map((dateKey) => {
              const date = parseISO(dateKey);
              const isSelected = selectedDate === dateKey;
              const isToday = isSameDay(date, today);
              
              return (
                <button
                  key={dateKey}
                  type="button"
                  onClick={() => handleDateSelect(dateKey)}
                  className={`px-4 py-3 rounded-lg border-2 transition-all text-left ${
                    isSelected
                      ? 'border-brand bg-brand text-white'
                      : 'border-dark/10 bg-white hover:border-brand/30'
                  } ${isToday && !isSelected ? 'ring-2 ring-brand/30' : ''}`}
                >
                  <p className="text-xs uppercase tracking-widest opacity-70">
                    {format(date, 'EEE')}
                  </p>
                  <p className={`text-lg font-serif mt-1 ${isSelected ? 'text-white' : 'text-dark'}`}>
                    {format(date, 'd')}
                  </p>
                  <p className="text-xs mt-0.5 opacity-70">
                    {format(date, 'MMM yyyy')}
                  </p>
                  {isToday && !isSelected && (
                    <span className="text-[8px] text-brand font-bold mt-1 block">TODAY</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Selección de hora (slot / horario) */}
      {selectedDate && timesForSelectedDate.length > 0 && (
        <div ref={timeSectionRef} className="scroll-mt-4">
          <h3 className="mb-2 font-serif text-xl text-dark">
            Select time
          </h3>
          <p className="mb-3 text-sm text-dark/60">
            {format(parseISO(selectedDate), 'EEEE, MMMM d')} — choose one slot
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {timesForSelectedDate.map((slot) => {
              const timeStr =
                typeof slot.time === 'string'
                  ? slot.time.slice(0, 5)
                  : String(slot.time).slice(0, 5);
              const isSelected = selectedTime === slot.time;
              const isLowStock = slot.available <= 3;
              const isSoldOut = slot.available === 0;
              
              return (
                <button
                  key={`${slot.date}-${slot.time}`}
                  type="button"
                  onClick={() => handleTimeSelect(slot.time)}
                  disabled={isSoldOut}
                  className={
                    isSelected
                      ? 'rounded-lg border-2 border-brand bg-brand p-4 text-left text-white transition-all'
                      : isSoldOut
                        ? 'cursor-not-allowed rounded-lg border border-dark/10 bg-gray-100 p-4 text-left opacity-50 transition-all'
                        : 'rounded-lg border border-dark/10 bg-white p-4 text-left transition-all hover:border-brand/30 hover:bg-cream/30'
                  }
                >
                  <p className="text-lg font-medium">{timeStr}</p>
                  <p
                    className={
                      isSelected
                        ? 'mt-1 text-xs uppercase tracking-widest text-white/70'
                        : 'mt-1 text-xs uppercase tracking-widest text-dark/60'
                    }
                  >
                    {isSoldOut
                      ? 'Sold Out'
                      : isLowStock
                        ? `Only ${slot.available} left`
                        : `${slot.available} available`}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal de Calendario */}
      {showCalendarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h3 className="font-serif text-xl text-dark">
                Select a Date
              </h3>
              <button
                type="button"
                onClick={() => setShowCalendarModal(false)}
                className="p-2 hover:bg-gray-100 rounded transition-colors"
                aria-label="Close calendar"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              {/* Navegación del mes */}
              <div className="flex items-center justify-between mb-4">
                <button
                  type="button"
                  onClick={prevMonth}
                  disabled={availableMonths.indexOf(format(calendarMonth, 'yyyy-MM')) === 0}
                  className={`p-2 rounded transition-colors ${
                    availableMonths.indexOf(format(calendarMonth, 'yyyy-MM')) === 0
                      ? 'opacity-30 cursor-not-allowed'
                      : 'hover:bg-gray-100'
                  }`}
                  aria-label="Previous month"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h4 className="font-serif text-lg text-dark">
                  {format(calendarMonth, 'MMMM yyyy')}
                </h4>
                <button
                  type="button"
                  onClick={nextMonth}
                  disabled={availableMonths.indexOf(format(calendarMonth, 'yyyy-MM')) === availableMonths.length - 1}
                  className={`p-2 rounded transition-colors ${
                    availableMonths.indexOf(format(calendarMonth, 'yyyy-MM')) === availableMonths.length - 1
                      ? 'opacity-30 cursor-not-allowed'
                      : 'hover:bg-gray-100'
                  }`}
                  aria-label="Next month"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Días de la semana */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-center text-xs font-bold uppercase tracking-widest text-gray-400 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendario Grid */}
              <div className="grid grid-cols-7 gap-1">
                {/* Días vacíos al inicio del mes */}
                {Array.from({ length: monthStart.getDay() }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square" />
                ))}
                
                {/* Días del mes */}
                {monthDays.map((day) => {
                  const dateKey = format(day, 'yyyy-MM-dd');
                  const hasSlots = availableDates.includes(dateKey);
                  const isSelected = selectedDate === dateKey;
                  const isToday = isSameDay(day, today);
                  
                  if (!hasSlots) {
                    return (
                      <div
                        key={dateKey}
                        className="aspect-square flex items-center justify-center text-gray-300 cursor-not-allowed"
                      >
                        <span className={isToday ? 'text-xs font-medium' : 'text-sm'}>
                          {format(day, 'd')}
                        </span>
                      </div>
                    );
                  }

                  return (
                    <button
                      key={dateKey}
                      type="button"
                      onClick={() => handleDateSelect(dateKey)}
                      className={`aspect-square flex flex-col items-center justify-center rounded transition-all ${
                        isSelected
                          ? 'bg-brand text-white border-2 border-brand'
                          : 'bg-white border border-gray-200 hover:border-brand hover:bg-cream/30'
                      } ${isToday && !isSelected ? 'ring-2 ring-brand/30' : ''}`}
                    >
                      <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-dark'}`}>
                        {format(day, 'd')}
                      </span>
                      {isToday && !isSelected && (
                        <span className="text-[8px] text-brand font-bold mt-0.5">TODAY</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Lista de meses disponibles */}
              {availableMonths.length > 1 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-xs uppercase tracking-widest text-gray-400 mb-3">
                    Quick Jump to Month
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {availableMonths.map((monthKey) => {
                      const monthDate = parseISO(`${monthKey}-01`);
                      const isCurrentMonth = format(calendarMonth, 'yyyy-MM') === monthKey;
                      
                      return (
                        <button
                          key={monthKey}
                          type="button"
                          onClick={() => setCalendarMonth(monthDate)}
                          className={`px-3 py-2 text-sm rounded border transition-all ${
                            isCurrentMonth
                              ? 'border-brand bg-brand text-white'
                              : 'border-gray-200 hover:border-brand hover:bg-cream/30'
                          }`}
                        >
                          {format(monthDate, 'MMM yyyy')}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

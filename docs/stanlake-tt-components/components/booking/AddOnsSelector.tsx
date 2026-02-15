'use client';

import { useState } from 'react';
import type { TTTicketType } from '@/lib/ticket-tailor';

interface AddOnsSelectorProps {
  ticketTypes: TTTicketType[];
  onSelectionChange: (selectedAddOns: Array<{ id: string; quantity: number }>) => void;
  currency?: string;
}

export function AddOnsSelector({ 
  ticketTypes, 
  onSelectionChange,
  currency = 'GBP' 
}: AddOnsSelectorProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Filter out the main ticket type (usually the first one or cheapest)
  // Assume add-ons have keywords like "with", "add", "extra", etc.
  const addOns = ticketTypes.filter(tt => 
    tt.name.toLowerCase().includes('with') || 
    tt.name.toLowerCase().includes('add') ||
    tt.name.toLowerCase().includes('extra') ||
    tt.name.toLowerCase().includes('cheese') ||
    tt.name.toLowerCase().includes('lunch')
  );

  if (addOns.length === 0) {
    return null;
  }

  const toggleAddOn = (id: string) => {
    const newSelected = new Set(selected);
    
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    
    setSelected(newSelected);
    
    // Notify parent component
    const selectedAddOns = Array.from(newSelected).map(addOnId => ({
      id: addOnId,
      quantity: 1,
    }));
    
    onSelectionChange(selectedAddOns);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(price);
  };

  return (
    <div className="space-y-4">
      <h3 className="font-serif text-xl text-dark">
        Enhance Your Experience
      </h3>
      
      <div className="space-y-3">
        {addOns.map((addOn) => {
          const isSelected = selected.has(addOn.id);
          
          return (
            <label
              key={addOn.id}
              className={`
                group relative flex items-start gap-4 p-4 
                border border-dark/10 rounded cursor-pointer
                transition-all duration-300
                hover:border-brand/30 hover:bg-cream/50
                ${isSelected ? 'border-brand bg-cream' : ''}
              `}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggleAddOn(addOn.id)}
                className="
                  mt-1 h-5 w-5 rounded border-dark/20 
                  text-brand focus:ring-brand focus:ring-offset-0
                  cursor-pointer
                "
              />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-dark">
                      {addOn.name}
                    </p>
                    {addOn.description && (
                      <p className="mt-1 text-sm text-dark/60">
                        {addOn.description}
                      </p>
                    )}
                  </div>
                  
                  <p className="font-serif text-lg text-brand shrink-0">
                    +{formatPrice(addOn.price)}
                  </p>
                </div>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}

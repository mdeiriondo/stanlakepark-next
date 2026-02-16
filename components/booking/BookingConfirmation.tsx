'use client';

import { CheckCircle2, Mail, Calendar, Users, MapPin } from 'lucide-react';
import Link from 'next/link';

interface BookingConfirmationProps {
  experienceName: string;
  date: string;
  time: string;
  guests: number;
  totalPrice: number;
  orderNumber?: string | number;
  orderId?: string | number;
}

// Función helper para formatear fecha
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

// Función helper para formatear hora
function formatTime(timeString: string): string {
  try {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const minute = minutes || '00';
    return `${hour.toString().padStart(2, '0')}:${minute}`;
  } catch {
    return timeString;
  }
}

export function BookingConfirmation({
  experienceName,
  date,
  time,
  guests,
  totalPrice,
  orderNumber,
  orderId,
}: BookingConfirmationProps) {
  return (
    <div className="bg-white rounded-lg border border-dark/10 p-8 md:p-12 max-w-2xl mx-auto">
      {/* Success Icon */}
      <div className="flex justify-center mb-6">
        <div className="rounded-full bg-green-100 p-4">
          <CheckCircle2 size={48} className="text-green-600" />
        </div>
      </div>

      {/* Title */}
      <h2 className="text-3xl font-serif text-dark text-center mb-4">
        Booking Confirmed!
      </h2>

      {/* Subtitle */}
      <p className="text-dark/60 text-center mb-8">
        Your reservation has been successfully processed. A confirmation email has been sent to your email address.
      </p>

      {/* Booking Details */}
      <div className="bg-dark/5 rounded-lg p-6 mb-8 space-y-4">
        <div className="flex items-start gap-4">
          <div className="mt-1">
            <Calendar size={20} className="text-brand" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-dark/60 uppercase tracking-wider mb-1">
              Experience
            </p>
            <p className="text-lg font-serif text-dark">{experienceName}</p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="mt-1">
            <Calendar size={20} className="text-brand" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-dark/60 uppercase tracking-wider mb-1">
              Date & Time
            </p>
            <p className="text-lg font-serif text-dark">
              {formatDate(date)} at {formatTime(time)}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="mt-1">
            <Users size={20} className="text-brand" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-dark/60 uppercase tracking-wider mb-1">
              Guests
            </p>
            <p className="text-lg font-serif text-dark">
              {guests} {guests === 1 ? 'guest' : 'guests'}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="mt-1">
            <MapPin size={20} className="text-brand" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-dark/60 uppercase tracking-wider mb-1">
              Total Paid
            </p>
            <p className="text-2xl font-serif text-brand">
              £{totalPrice.toFixed(2)}
            </p>
          </div>
        </div>

        {orderNumber && (
          <div className="pt-4 border-t border-dark/10">
            <p className="text-sm text-dark/60">
              Order Number: <span className="font-medium text-dark">{orderNumber}</span>
            </p>
          </div>
        )}
      </div>

      {/* Email Notice */}
      <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
        <Mail size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-blue-900 mb-1">
            Check your email
          </p>
          <p className="text-sm text-blue-700">
            We've sent a confirmation email with all the details of your booking. 
            Please check your inbox (and spam folder) for the confirmation.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/experiences"
          className="flex-1 px-6 py-3 border border-dark/10 rounded-lg font-medium text-dark hover:bg-dark/5 transition-colors text-center"
        >
          Browse More Experiences
        </Link>
        <Link
          href="/"
          className="flex-1 px-6 py-3 bg-brand text-cream rounded-lg font-medium uppercase tracking-widest hover:bg-brand/90 transition-colors text-center whitespace-nowrap"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}

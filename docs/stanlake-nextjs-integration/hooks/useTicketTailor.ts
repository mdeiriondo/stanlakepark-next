// hooks/useTicketTailor.ts
'use client';

import { useState, useEffect } from 'react';
import type { TTEvent, TTEventWithAvailability } from '@/lib/ticket-tailor';

/**
 * Hook to fetch all upcoming events from Ticket Tailor
 */
export function useEvents() {
  const [events, setEvents] = useState<TTEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const response = await fetch('/api/tt/events');
        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch events');
        }

        setEvents(data.events);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  return { events, loading, error };
}

/**
 * Hook to fetch event details with availability
 */
export function useEventDetails(eventId: string | null) {
  const [data, setData] = useState<TTEventWithAvailability | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId) {
      setData(null);
      return;
    }

    async function fetchEventDetails() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/tt/event/${eventId}`);
        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || 'Failed to fetch event details');
        }

        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchEventDetails();
  }, [eventId]);

  return { data, loading, error };
}

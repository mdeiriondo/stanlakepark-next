'use client';

import { useState, useEffect } from 'react';

export interface Slot {
  id: number;
  experience_slug: string;
  date: string;
  time: string;
  capacity: number;
  booked: number;
  available: number;
  price_per_person: number;
}

export function useAvailableSlots(
  experienceSlug: string,
  fromDate?: string
) {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!experienceSlug) return;

    async function fetchSlots() {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          experience: experienceSlug,
        });
        if (fromDate) {
          params.append('from', fromDate);
        }

        const response = await fetch(`/api/slots/available?${params}`);
        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch slots');
        }

        setSlots(data.slots ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchSlots();
  }, [experienceSlug, fromDate]);

  return { slots, loading, error };
}

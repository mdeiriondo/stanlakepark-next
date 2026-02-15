// lib/ticket-tailor.ts

/**
 * Generates a Ticket Tailor checkout URL with pre-selected items
 * 
 * @param eventId - Ticket Tailor event ID
 * @param ticketTypeId - Main ticket type ID (e.g., "General Admission")
 * @param quantity - Number of tickets
 * @param addons - Array of addon ticket type IDs with quantities
 * @returns Full checkout URL
 */
export function generateCheckoutUrl(params: {
  eventId: string;
  ticketTypeId: string;
  quantity?: number;
  addons?: Array<{ id: string; quantity: number }>;
}): string {
  const { eventId, ticketTypeId, quantity = 1, addons = [] } = params;
  
  // Base checkout URL
  const baseUrl = `https://buytickets.at/stanlakepark/${eventId}`;
  
  // Build query params
  const queryParams = new URLSearchParams();
  
  // Add main ticket
  queryParams.append('ticket_type_id', ticketTypeId);
  queryParams.append('quantity', quantity.toString());
  
  // Add addons (if any)
  addons.forEach((addon) => {
    queryParams.append(`addon[${addon.id}]`, addon.quantity.toString());
  });
  
  return `${baseUrl}?${queryParams.toString()}`;
}

/**
 * TypeScript types for Ticket Tailor API responses
 */

export interface TTEvent {
  id: string;
  name: string;
  description: string;
  start: {
    date: string;
    time: string;
    iso: string;
    timezone: string;
  };
  end: {
    date: string;
    time: string;
    iso: string;
    timezone: string;
  };
  venue: {
    name: string;
    postal_code: string;
  };
  currency: string;
  url: string;
  total_tickets?: number;
  images?: {
    header?: string;
  };
}

export interface TTTicketType {
  id: string;
  name: string;
  price: number;
  description: string;
  quantity: number;
}

export interface TTAvailability {
  totalCapacity: number;
  ticketsSold: number;
  ticketsAvailable: number;
  isSoldOut: boolean;
  isLowStock: boolean;
}

export interface TTEventWithAvailability {
  event: TTEvent;
  availability: TTAvailability;
  ticketTypes: TTTicketType[];
}

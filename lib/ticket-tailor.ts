// lib/ticket-tailor.ts

const TT_ACCOUNT = process.env.NEXT_PUBLIC_TT_ACCOUNT_NAME || 'stanlakepark';

/**
 * Generates a Ticket Tailor checkout URL with pre-selected items.
 *
 * IMPORTANT: Ticket Tailor uses two IDs:
 * - API ID: ev_xxxx (from GET /v1/events) — does NOT work in public URLs
 * - Public/checkout ID: numeric (e.g. 2061731) — used in buytickets.at/stanlakepark/2061731
 *
 * Prefer checkoutBaseUrl (from event.url in the API) so the link always works.
 */
export function generateCheckoutUrl(params: {
  /** Public checkout URL from TT API (event.url), e.g. https://buytickets.at/stanlakepark/2061731 */
  checkoutBaseUrl?: string;
  /** Fallback: event ID. Use numeric ID (2061731) if you don't have checkoutBaseUrl; ev_xxx will 404 in browser */
  eventId?: string;
  ticketTypeId: string;
  quantity?: number;
  addons?: Array<{ id: string; quantity: number }>;
}): string {
  const { checkoutBaseUrl, eventId, ticketTypeId, quantity = 1, addons = [] } = params;

  let base: string;
  if (checkoutBaseUrl) {
    try {
      const u = new URL(checkoutBaseUrl);
      base = u.origin + u.pathname.replace(/\/$/, '');
    } catch {
      base = eventId ? `https://buytickets.at/${TT_ACCOUNT}/${eventId}` : '';
    }
  } else if (eventId) {
    base = `https://buytickets.at/${TT_ACCOUNT}/${eventId}`;
  } else {
    return '';
  }

  const queryParams = new URLSearchParams();
  queryParams.append('ticket_type_id', ticketTypeId);
  queryParams.append('quantity', quantity.toString());
  addons.forEach((addon) => {
    queryParams.append(`addon[${addon.id}]`, addon.quantity.toString());
  });

  return `${base}?${queryParams.toString()}`;
}

/**
 * Build a simple checkout URL when we only have the public ID (numeric) or the full event.url.
 * Use this when you don't have ticketTypeId (e.g. user will select on TT).
 */
export function getCheckoutBaseUrl(publicIdOrUrl: string): string {
  if (publicIdOrUrl.startsWith('http')) {
    try {
      const u = new URL(publicIdOrUrl);
      return u.origin + u.pathname.replace(/\/$/, '');
    } catch {
      return `https://buytickets.at/${TT_ACCOUNT}/${publicIdOrUrl}`;
    }
  }
  return `https://buytickets.at/${TT_ACCOUNT}/${publicIdOrUrl}`;
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

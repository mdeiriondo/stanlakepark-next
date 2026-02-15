/**
 * WordPress REST API – alineado con stanlake-headless-theme-functions.php
 *
 * CPTs y rest_base definidos en el theme:
 * - experience_info → /wp/v2/experience_info (Experiences hub)
 * - wines          → /wp/v2/wines
 * - venues         → /wp/v2/venues
 * - accommodation  → /wp/v2/accommodation
 *
 * ACF para experience_info (CPT-experiences.json): badge, price, duration, availability.
 * "Show in REST API" debe estar activo en el field group.
 */

const BASE_URL =
  process.env.WORDPRESS_API_URL ||
  process.env.NEXT_PUBLIC_WORDPRESS_API_URL;

/** rest_base de cada CPT según el theme (stanlake_register_cpts) */
export const WP_REST_CPTS = {
  experienceInfo: 'experience_info',
  wines: 'wines',
  venues: 'venues',
  accommodation: 'accommodation',
} as const;

/** Respuesta de un post en la REST API (con ?_embed para featured media) */
type WPRestPost = {
  id: number;
  slug: string;
  title: { rendered: string };
  content: { rendered: string };
  excerpt?: { rendered: string };
  acf?: Record<string, unknown>;
  _embedded?: {
    'wp:featuredmedia'?: { source_url: string }[];
  };
};

export type ExperienceType =
  | 'wine_tour_tasting'
  | 'wine_cheese_tour'
  | 'wine_cream_tea'
  | 'wine_cheese_tasting'
  | 'work_vineyard'
  | 'special_tastings'
  | 'special_events'
  | 'wset_courses';

/** Shape normalizado para ExperienceHub y páginas de experiencias */
export type Experience = {
  databaseId: number;
  slug: string;
  title: string;
  content: string;
  featuredImage?: { node: { sourceUrl: string } };
  experienceDetails: {
    experienceType: ExperienceType;
    duration: string;
    badge: string | null;
    shortDescription: string;
    whatsIncluded: { item: string }[];
  };
  pricing: { basePrice: number; pricingType: string };
  scheduling: { scheduleType: string; displaySchedule?: string };
  /** ID del evento en Ticket Tailor para reservas integradas (sin salir del sitio) */
  ticketTailorEventId: string | null;
};

function readAcf(post: WPRestPost, key: string): unknown {
  return post.acf?.[key];
}

/** Decodifica entidades HTML que WordPress devuelve en títulos y textos (ej. &#038; → &) */
function decodeHtmlEntities(str: string): string {
  if (!str) return str;
  return str
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;/g, "'");
}

/** Parsea precio desde ACF (texto tipo "£22.00" o número) */
function parsePrice(value: unknown): number {
  if (typeof value === 'number' && !Number.isNaN(value)) return value;
  const s = String(value ?? '').replace(/[^\d.]/g, '');
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : 0;
}

function normalizeExperience(post: WPRestPost): Experience {
  const acf = post.acf as Record<string, unknown> | undefined;
  const duration = String(acf?.duration_display ?? '');
  const availability = String(acf?.availability ?? '');
  const badge = acf?.badge != null ? String(acf.badge) : null;
  const price = parsePrice(acf?.price);

  const VALID_TYPES: ExperienceType[] = [
    'wine_tour_tasting', 'wine_cheese_tour', 'wine_cream_tea', 'wine_cheese_tasting',
    'work_vineyard', 'special_tastings', 'special_events', 'wset_courses',
  ];
  const rawType = String(acf?.experience_type ?? acf?.experienceType ?? 'wine_tour_tasting');
  const experienceType: ExperienceType = VALID_TYPES.includes(rawType as ExperienceType)
    ? (rawType as ExperienceType)
    : 'wine_tour_tasting';
  const shortDescription =
    (post.excerpt?.rendered ?? '')
      .replace(/<[^>]+>/g, '')
      .trim() ||
    String(acf?.short_description ?? acf?.shortDescription ?? '');

  const whatsIncludedRaw = acf?.whats_included ?? acf?.whatsIncluded;
  const whatsIncluded: { item: string }[] = Array.isArray(whatsIncludedRaw)
    ? (whatsIncludedRaw as { item?: string }[]).map((row) => ({ item: row?.item ?? String(row) }))
    : typeof whatsIncludedRaw === 'string' && whatsIncludedRaw
      ? [{ item: whatsIncludedRaw }]
      : [];

  const featuredUrl = post._embedded?.['wp:featuredmedia']?.[0]?.source_url;
  const ticketTailorEventId =
    acf?.ticket_tailor_event_id != null && String(acf.ticket_tailor_event_id).trim() !== ''
      ? String(acf.ticket_tailor_event_id).trim()
      : null;

  return {
    databaseId: post.id,
    slug: post.slug,
    title: decodeHtmlEntities(post.title?.rendered ?? ''),
    content: post.content?.rendered ?? '',
    featuredImage: featuredUrl ? { node: { sourceUrl: featuredUrl } } : undefined,
    experienceDetails: {
      experienceType,
      duration,
      badge: badge != null ? decodeHtmlEntities(badge) : null,
      shortDescription: decodeHtmlEntities(shortDescription),
      whatsIncluded: whatsIncluded.map((w) => ({ item: decodeHtmlEntities(w.item) })),
    },
    pricing: { basePrice: price, pricingType: 'fixed' },
    scheduling: { scheduleType: 'recurring', displaySchedule: availability || undefined },
    ticketTailorEventId,
  };
}

/**
 * Lista de experiencias desde /wp/v2/experience_info (CPT definido en el theme).
 */
export async function getExperiences(): Promise<Experience[]> {
  try {
    if (!BASE_URL) return [];
    const base = BASE_URL.replace(/\/$/, '');
    const url = `${base}/${WP_REST_CPTS.experienceInfo}?_embed&per_page=100`;
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const data = await res.json();
    const posts: WPRestPost[] = Array.isArray(data) ? data : [];
    return posts.map(normalizeExperience);
  } catch {
    return [];
  }
}

export async function getExperienceInfo(): Promise<Experience[]> {
  return getExperiences();
}

/** Shape para la página de detalle (compatible con el template actual) */
export type ExperienceDetail = {
  title: { rendered: string };
  content: { rendered: string };
  acf: {
    duration_display?: string;
    whats_included?: string;
    ticket_tailor_event_id?: string | null;
    short_description?: string;
    price: number;
    display_schedule?: string;
    faq?: { question: string; answer: string }[];
    gallery?: unknown;
  };
  _embedded?: {
    'wp:featuredmedia'?: { source_url: string }[];
  };
};

export async function getExperienceInfoBySlug(slug: string): Promise<ExperienceDetail | null> {
  try {
    if (!BASE_URL) return null;
    const base = BASE_URL.replace(/\/$/, '');
    const url = `${base}/${WP_REST_CPTS.experienceInfo}?slug=${encodeURIComponent(slug)}&_embed`;
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const data = await res.json();
    const posts = Array.isArray(data) ? data : [data];
    const post: WPRestPost | undefined = posts[0];
    if (!post) return null;

    const acf = (post.acf ?? {}) as Record<string, unknown>;
    const whatsIncluded = acf.whats_included ?? acf.whatsIncluded;
    const faq = Array.isArray(acf.faq) ? acf.faq : [];
    const price = parsePrice(acf?.price);
    const displaySchedule = decodeHtmlEntities(String(acf.display_schedule ?? acf.availability ?? ''));

    return {
      title: { rendered: decodeHtmlEntities((post.title ?? { rendered: '' }).rendered) },
      content: post.content ?? { rendered: '' },
      acf: {
        duration_display: decodeHtmlEntities(String(acf.duration_display ?? '')),
        whats_included: typeof whatsIncluded === 'string' ? whatsIncluded : '',
        ticket_tailor_event_id: (acf.ticket_tailor_event_id as string) ?? null,
        short_description: decodeHtmlEntities(String(acf.short_description ?? acf.shortDescription ?? '')),
        price,
        display_schedule: displaySchedule || undefined,
        faq: faq as { question: string; answer: string }[],
        gallery: acf.gallery,
      },
      _embedded: post._embedded,
    };
  } catch {
    return null;
  }
}

STANLAKE PARK - PROJECT CONTEXT & GUIDELINES

1. Tech Stack (Strict)

Framework: Next.js 16.1.6 (App Router) with Turbopack.

Styling: Tailwind CSS 4.0 (Native CSS configuration via @theme).

Icons: Lucide React (lucide-react).

Language: TypeScript.

2. Core Design Principles ("The Luxury Standard")

Typography: - Headings: font-serif (Playfair Display).

Body/UI: font-sans (Inter).

Use tracking-widest (tracking-[0.3em]) for uppercase labels.

Colors (Tailwind Variables):

Brand: text-brand / bg-brand (#760235 - Burgundy).

Cream: text-cream / bg-cream (#F2F0E9).

Dark: text-dark / bg-dark (#0a0a0a).

Gold: text-gold (#C5A059).

Cursor System:

The native system cursor is HIDDEN via CSS (cursor: none !important).

We use a custom Ring & Dot cursor component (src/components/ui/CustomCursor.tsx).

Elements must be interactive (anchor tags, buttons) to trigger the cursor hover state.

3. Mandatory Components

Navigation: Use <TransitionLink> (from @/components/ui/TransitionLink) instead of next/link for internal page navigation to trigger the cinematic overlay.

Animations: Wrap scrolling content in <Reveal> (from @/components/ui/Reveal) for smooth entry.

Buttons: Use the shared <Button> component with variants (primary, outline, whiteOutline, wedding).

4. Next.js 16 Specifics

Async Params: In dynamic routes ([slug]/page.tsx), params is a Promise. Always await params before accessing properties.

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
const { slug } = await params;
}

Turbopack: Avoid legacy Tailwind 3 config files (tailwind.config.ts). All theme config is in src/app/globals.css inside @theme.

5. File Structure

src/app: Routes.

src/components/layout: Structural components (Navbar, Footer, Hero).

src/components/ui: Reusable small components (Cards, Buttons).

src/context: Global state (TransitionContext).

Keep the design editorial, clean, and luxurious. Avoid standard Bootstrap-like layouts.

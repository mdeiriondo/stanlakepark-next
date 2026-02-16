import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import CustomCursor from "@/components/ui/CustomCursor";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { TransitionProvider } from "@/context/TransitionContext";
import { CartProvider } from "@/contexts/CartContext";
import TransitionOverlay from "@/components/layout/TransitionOverlay";

// Cargamos las fuentes con 'swap' para que no haya flash de texto invisible
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Stanlake Park Wine Estate",
  description: "English Wine Reimagined.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // IMPORTANTE: Las variables van aquí en el HTML para alcance global
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} scroll-smooth`}
    >
      <body className="font-sans antialiased bg-white text-black selection:bg-[#760235] selection:text-white cursor-none">
        <TransitionProvider>
          <CartProvider>
            <TransitionOverlay />
            <CustomCursor />
            {children}
          </CartProvider>
        </TransitionProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}

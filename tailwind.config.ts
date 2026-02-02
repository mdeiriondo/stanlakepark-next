import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#760235",
          dark: "#5a0128",
        },
        cream: "#F2F0E9",
        dark: "#0a0a0a",
        gold: "#C5A059",
      },
      fontFamily: {
        // Aquí se hace la magia. Tailwind busca la variable CSS que inyectó Next.js
        serif: ["var(--font-playfair)", "serif"],
        sans: ["var(--font-inter)", "sans-serif"],
      },
      animation: {
        "ken-burns":
          "kenburns 40s infinite alternate cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      },
      keyframes: {
        kenburns: {
          "0%": { transform: "scale(1)" },
          "100%": { transform: "scale(1.15)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;

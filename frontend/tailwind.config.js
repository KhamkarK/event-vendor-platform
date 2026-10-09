/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        // Warm display serif for headlines & the wordmark — the main note that keeps this
        // from reading as a stock sans-only SaaS template.
        display: ["Fraunces", "ui-serif", "Georgia", "serif"],
      },
      colors: {
        // Deep mehendi-maroon — the primary brand hue, evoking wedding invites & bridal attire.
        brand: {
          50: "#effafa",
          100: "#d5f2f1",
          200: "#aee5e3",
          300: "#78d0cd",
          400: "#36afad",
          500: "#0f7b7b",
          600: "#0b6262",
          700: "#094d4d",
          800: "#083f3f",
          900: "#063232",
        },
        // Marigold / haldi gold — the festive accent used across CTAs and highlights.
        accent: {
          50: "#fff8e6",
          100: "#feecbd",
          200: "#fcdb8a",
          300: "#f9c85c",
          400: "#f6b73c",
          500: "#e09710",
          600: "#bd7a0b",
          700: "#945c0d",
          800: "#764a10",
          900: "#623d11",
        },
        surface: {
          DEFAULT: "#fdfcfa",
          soft: "#faf7f2",
          dark: "#150c0e",
          darkCard: "#241417",
        },
      },
      boxShadow: {
        glow: "0 8px 30px -8px rgba(15, 123, 123, 0.4)",
        card: "0 1px 2px rgba(21,12,14,0.05), 0 8px 24px -12px rgba(21,12,14,0.14)",
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #073f3f 0%, #0b6262 55%, #0f7b7b 100%)",
        "brand-gradient-soft": "linear-gradient(135deg, #effafa 0%, #fff8e6 100%)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: 0, transform: "translateY(8px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        flicker: {
          "0%, 100%": { opacity: 1, transform: "scaleY(1)" },
          "50%": { opacity: 0.85, transform: "scaleY(0.94)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.5s ease-out both",
        shimmer: "shimmer 2.5s linear infinite",
        flicker: "flicker 1.6s ease-in-out infinite",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};

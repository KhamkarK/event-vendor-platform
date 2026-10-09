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
          50: "#fbf1f4",
          100: "#f6dde4",
          200: "#ecbccb",
          300: "#dd8fa9",
          400: "#c05a7b",
          500: "#7a1f3d",
          600: "#651832",
          700: "#4f1226",
          800: "#3f0f20",
          900: "#330c1a",
        },
        // Marigold / haldi gold — the festive accent used across CTAs and highlights.
        accent: {
          50: "#fbf4e4",
          100: "#f6e7c4",
          200: "#eed39a",
          300: "#e8c16f",
          400: "#e2b04a",
          500: "#cf9a35",
          600: "#b0802a",
          700: "#8f6420",
          800: "#6e4d1d",
          900: "#5a3f1b",
        },
        surface: {
          DEFAULT: "#fdfcfa",
          soft: "#faf7f2",
          dark: "#150c0e",
          darkCard: "#241417",
        },
      },
      boxShadow: {
        glow: "0 8px 30px -8px rgba(122, 31, 61, 0.45)",
        card: "0 1px 2px rgba(21,12,14,0.05), 0 8px 24px -12px rgba(21,12,14,0.14)",
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #4f1226 0%, #651832 55%, #7a1f3d 100%)",
        "brand-gradient-soft": "linear-gradient(135deg, #fbf1f4 0%, #fbf4e4 100%)",
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

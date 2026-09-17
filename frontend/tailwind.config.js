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
          50: "#fdf2f4",
          100: "#fce3e9",
          200: "#f7c3d0",
          300: "#ee93aa",
          400: "#df5c7d",
          500: "#a91d43",
          600: "#8a1636",
          700: "#6d112a",
          800: "#571023",
          900: "#480f1f",
        },
        // Marigold / haldi gold — the festive accent used across CTAs and highlights.
        accent: {
          50: "#fffaeb",
          100: "#fef0c7",
          200: "#fddc88",
          300: "#fcc242",
          400: "#f7a71e",
          500: "#e08e0b",
          600: "#bd6a07",
          700: "#97500a",
          800: "#7a400f",
          900: "#663610",
        },
        surface: {
          DEFAULT: "#fdfcfa",
          soft: "#faf7f2",
          dark: "#150c0e",
          darkCard: "#241417",
        },
      },
      boxShadow: {
        glow: "0 8px 30px -8px rgba(169, 29, 67, 0.45)",
        card: "0 1px 2px rgba(21,12,14,0.05), 0 8px 24px -12px rgba(21,12,14,0.14)",
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #8a1636 0%, #a91d43 45%, #e08e0b 100%)",
        "brand-gradient-soft": "linear-gradient(135deg, #fdf2f4 0%, #fffaeb 100%)",
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

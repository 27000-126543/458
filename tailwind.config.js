/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        navy: {
          DEFAULT: "#0F172A",
          50: "#1E293B",
          100: "#1A2332",
          200: "#162032",
          300: "#131C2E",
          400: "#101828",
          500: "#0F172A",
          600: "#0C1322",
          700: "#0A0F1B",
          800: "#070B14",
          900: "#04060D",
        },
        emerald: {
          DEFAULT: "#10B981",
          50: "#ECFDF5",
          100: "#D1FAE5",
          200: "#A7F3D0",
          300: "#6EE7B7",
          400: "#34D399",
          500: "#10B981",
          600: "#059669",
          700: "#047857",
          800: "#065F46",
          900: "#064E3B",
        },
        amber: {
          DEFAULT: "#F59E0B",
          50: "#FFFBEB",
          100: "#FEF3C7",
          200: "#FDE68A",
          300: "#FCD34D",
          400: "#FBBF24",
          500: "#F59E0B",
          600: "#D97706",
          700: "#B45309",
          800: "#92400E",
          900: "#78350F",
        },
        slate: {
          50: "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
          300: "#CBD5E1",
          400: "#94A3B8",
          500: "#64748B",
          600: "#475569",
          700: "#334155",
          800: "#1E293B",
          900: "#0F172A",
          950: "#020617",
        },
      },
      fontFamily: {
        heading: ['"DM Sans"', "system-ui", "sans-serif"],
        body: [
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          '"Noto Sans"',
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
      },
      backgroundImage: {
        "gradient-cyan-blue":
          "linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)",
        "gradient-navy":
          "linear-gradient(180deg, #0F172A 0%, #1E293B 100%)",
        "gradient-emerald":
          "linear-gradient(135deg, #10B981 0%, #059669 100%)",
        "gradient-amber":
          "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
      },
      animation: {
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "slide-in": "slide-in-right 0.3s ease-out",
        "fade-in": "fade-in-up 0.4s ease-out",
        "flip-number": "flip 0.6s ease-in-out",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "fade-in-up": "fade-in-up 0.4s ease-out",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 5px rgba(16, 185, 129, 0.3)" },
          "50%": { boxShadow: "0 0 20px rgba(16, 185, 129, 0.6)" },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "fade-in-up": {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        flip: {
          "0%": { transform: "rotateX(0deg)" },
          "50%": { transform: "rotateX(90deg)" },
          "100%": { transform: "rotateX(0deg)" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};

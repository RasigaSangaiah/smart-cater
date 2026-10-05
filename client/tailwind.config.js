/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1F1B16",
        cream: "#FBF8F3",
        paper: "#FFFFFF",
        wine: {
          DEFAULT: "#2B1220",
          light: "#3D1B30",
          dark: "#1A0B14",
        },
        saffron: {
          DEFAULT: "#D9A441",
          light: "#F0C878",
          dark: "#B8842D",
        },
        paprika: {
          DEFAULT: "#A6301D",
          dark: "#7E2416",
          light: "#C24A34",
        },
        turmeric: {
          DEFAULT: "#C48A2E",
          light: "#E0B45C",
          dark: "#96691E",
        },
        sage: {
          DEFAULT: "#4B6B4C",
          light: "#6E8E6E",
        },
        stone: {
          50: "#FAF8F5",
          100: "#F1ECE3",
          200: "#E4DCCC",
          300: "#CFC3AC",
          400: "#A99A7E",
          500: "#847459",
          600: "#655944",
          700: "#4A4132",
          800: "#332C22",
          900: "#211C15",
        },
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        sans: ["Work Sans", "sans-serif"],
      },
      boxShadow: {
        card: "0 2px 16px rgba(33, 28, 21, 0.08)",
        lift: "0 12px 32px rgba(33, 28, 21, 0.14)",
        glow: "0 0 60px rgba(217, 164, 65, 0.25)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      keyframes: {
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        "rise-in": {
          "0%": { opacity: "0", transform: "translateY(18px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "spin-slow": "spin-slow 40s linear infinite",
        "spin-slower": "spin-slow 60s linear infinite reverse",
        "rise-in": "rise-in 0.7s cubic-bezier(0.16, 1, 0.3, 1) both",
      },
    },
  },
  plugins: [],
};
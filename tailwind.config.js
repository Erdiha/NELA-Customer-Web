/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // NELA Sunset Theme
        primary: "#7c3aed", // Rich purple
        "primary-light": "#8b5cf6",
        "primary-dark": "#6d28d9",

        secondary: "#f59e0b", // Warm amber/gold
        "secondary-light": "#fbbf24",
        "secondary-dark": "#d97706",

        accent: "#06b6d4", // Bright cyan
        "accent-light": "#22d3ee",
        "accent-dark": "#0891b2",

        success: "#10b981", // Emerald green
        danger: "#ef4444", // Red

        neutral: {
          50: "#fafafa",
          100: "#f4f4f5",
          200: "#e4e4e7",
          300: "#d4d4d8",
          400: "#a1a1aa",
          500: "#71717a",
          600: "#52525b",
          700: "#3f3f46",
          800: "#27272a",
          900: "#18181b",
        },
      },
    },
  },
  plugins: [],
};

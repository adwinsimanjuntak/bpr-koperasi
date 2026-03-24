/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#1D4ED8",
          dark: "#1E40AF",
          gradientFrom: "#2563EB",
          gradientTo: "#1D4ED8",
        },
        surface: "#F1F5F9",
        ink: {
          DEFAULT: "#0F172A",
          muted: "#64748B",
        },
        success: "#22C55E",
        warning: "#F59E0B",
        danger: "#EF4444",
        info: "#3B82F6",
      },
      boxShadow: {
        card: "0 1px 3px 0 rgb(15 23 42 / 0.06), 0 1px 2px -1px rgb(15 23 42 / 0.06)",
      },
    },
  },
  plugins: [],
};

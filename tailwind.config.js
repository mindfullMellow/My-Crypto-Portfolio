/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./*.html",
    "./html/**/*.html",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./src/main.css",
  ],
  theme: {
    extend: {
      colors: {
        background: "#121712",
        "border-color": "#2d372a",
        hover: "#0a7121",
        "hover-red": "#710a1a",
        "text-color-1": "#a5b6a0",
        "table-color": "#42513e",
        "table-bg": "#131712",
        "table-bg-2": "#1f251d",
        "tabel-top-border": "#42513e",
        "change-red": "#da0b35",
        "change-green": "#0bda35",
        placeholder: "#6f816a",
        "input-bg": "#f2f4f1",
        "input-text": "#131612",
      },
      fontFamily: {
        manrope: ["Manrope", "sans-serif"],
        Noto: ["Noto-sans", "sans-serif"],
      },
    },
  },
  plugins: [],
};

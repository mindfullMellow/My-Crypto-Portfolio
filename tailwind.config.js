/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#121712",
        "border-color": "#2d372a",
        hover: "#0a7121",
      },
      fontFamily: {
        manrope: ["Manrope", "sans-serif"],
        Noto: ["Noto-sans", "sans-serif"],
      },
    },
  },
  plugins: [],
};

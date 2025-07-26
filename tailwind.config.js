/** @type {import('tailwindcss').Config} */
export default {
  content: ["./*.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#121712",
        "border-color": "#2d372a",
        hover: "#0a7121",
        "text-color-1": "#a5b6a0",
        "table-color": "#42513e",
        "table-bg": "#131712",
        "table-bg-2": "#1f251d",
        "tabel-top-border": "#42513e",
        "change-red": "#da0b35",
        "change-green": "#0bda35",
      },
      fontFamily: {
        manrope: ["Manrope", "sans-serif"],
        Noto: ["Noto-sans", "sans-serif"],
      },
      keyframes: {
        waveBounce: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      animation: {
        "wave-1": "waveBounce 1s ease-in-out infinite",
        "wave-2": "waveBounce 1s ease-in-out infinite 0.2s",
        "wave-3": "waveBounce 1s ease-in-out infinite 0.4s",
      },
    },
  },
  plugins: [],
};

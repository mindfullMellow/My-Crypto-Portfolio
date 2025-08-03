import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: "index.html",
        calculator: "calculator.html",
        asset_quantity_calc: "./src/asset_quantity_calc.js",
        percentagecalc: "./src/percentagecalc.js",
      },
    },
  },
  server: {
    hmr: {
      host: "localhost",
      port: 5173,
      protocol: "ws",
    },
  },
});

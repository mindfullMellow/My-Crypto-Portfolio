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
    host: "0.0.0.0", // this is the key part for phone access
    port: 5173,
    hmr: {
      host: "0.0.0.0",
      port: 5173,
      protocol: "ws",
    },
  },
});

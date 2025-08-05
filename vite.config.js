import { defineConfig } from "vite";
import dotenv from "dotenv";
dotenv.config();

console.log("VITE_DEV_HOST is:", process.env.VITE_DEV_HOST);

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
    host: "0.0.0.0",
    port: 5173,
    open: true,
    hmr: {
      host: process.env.VITE_DEV_HOST || "localhost",
      port: 5173,
      protocol: "ws",
    },
  },
});

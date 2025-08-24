import { defineConfig } from "vite";
import dotenv from "dotenv";
dotenv.config();

console.log("VITE_DEV_HOST is:", process.env.VITE_DEV_HOST);

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: "index.html",
        calculator: "./html/calculator.html",
        wallet_manager: "./html/wallet_manager.html",
        asset_quantity_calc: "./src/extras/asset_quantity_calc.js",
        percentagecalc: "./src/extras/percentagecalc.js",
        ApiLogic: "./src/APIs/ApiLogic.js",
        fecth_vps_data: "./src/APIs/fecth_vps_data.js",
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

import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: "index.html",
        calculator: "calculator.html",
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

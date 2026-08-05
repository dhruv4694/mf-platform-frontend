import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Allow connections from outside the container (needed for Docker)
    host: "0.0.0.0",
    proxy: {
      // Proxy /api requests to the Spring Boot backend.
      //
      // LOCAL DEV (npm run dev on your machine):
      //   VITE_API_URL is not set → defaults to localhost:8080
      //
      // DOCKER DEV (compose.dev.yml):
      //   VITE_API_URL=http://app:8080 is set via environment in compose.dev.yml
      //   "app" is the Docker service name — containers talk to each other by name
      //
      // This single config handles both cases without changing any code.
      "/api": {
        target: process.env.VITE_API_URL || "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
});

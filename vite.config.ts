/// <reference types="vitest/config" />
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // transforma o site em PWA: manifesto (instalável) + service worker (funciona offline).
    // autoUpdate: quando sai versão nova, o app se atualiza sozinho na próxima abertura.
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "spiral",
        short_name: "spiral",
        description: "ferramentas para teste e desenvolvimento. tudo roda no seu navegador.",
        lang: "pt-BR",
        start_url: "/",
        scope: "/",
        display: "standalone",
        background_color: "#0B0814",
        theme_color: "#06030C",
        icons: [
          { src: "/brand/pwa-192.png", sizes: "192x192", type: "image/png" },
          { src: "/brand/pwa-512.png", sizes: "512x512", type: "image/png" },
          { src: "/brand/pwa-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        // guarda o site inteiro (inclui o código de cada ferramenta, que é carregado sob demanda)
        globPatterns: ["**/*.{js,css,html,svg,png,woff,woff2}"],
        // qualquer endereço do site (/regra-de-tres, /cpf...) abre o mesmo index.html, como no vercel.json
        navigateFallback: "/index.html",
      },
    }),
  ],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});

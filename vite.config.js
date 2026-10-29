import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // 'prompt' keeps the waiting worker until the user accepts the update,
      // so a deploy never swaps assets out from under an open tab.
      registerType: 'prompt',
      injectRegister: false,
      includeAssets: ['favicon.ico', 'favicon16.png', 'favicon32.png', 'apple-touch-icon.png', 'robots.txt'],
      manifest: {
        name: 'url2qr',
        short_name: 'url2qr',
        description: 'Shorten links, share them as QR codes and track every click.',
        start_url: '/',
        display: 'standalone',
        theme_color: '#05070f',
        background_color: '#05070f',
        icons: [
          { src: 'logo192.png', sizes: '192x192', type: 'image/png' },
          { src: 'logo512.png', sizes: '512x512', type: 'image/png' },
          { src: 'logo512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,webp,svg,webmanifest}'],
        // Shortcode paths (/abc123) are client routes: serve the cached shell.
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
        clientsClaim: true,
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.js'],
    css: false,
    alias: {
      'virtual:pwa-register/react': new URL('./src/test/pwaRegisterStub.js', import.meta.url).pathname,
    },
  },
});

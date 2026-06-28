import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default {
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon.svg', 'offline.html'],
      manifest: {
        name: 'Аналитик Pro',
        short_name: 'Аналитик Pro',
        description: 'Локальный PWA-тренажёр hard skills системного аналитика',
        theme_color: '#14121e',
        background_color: '#14121e',
        display: 'standalone',
        start_url: '/',
        lang: 'ru',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: '/icons/icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        navigateFallback: '/index.html',
        globPatterns: ['**/*.{js,css,html,svg,png,woff2,json,wasm}'],
        runtimeCaching: [
          {
            urlPattern: ({ request, sameOrigin }) =>
              sameOrigin && request.destination === 'document',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'analyst-pro-pages',
              networkTimeoutSeconds: 3
            }
          },
          {
            urlPattern: ({ request, sameOrigin }) =>
              sameOrigin &&
              ['script', 'style', 'font', 'image'].includes(request.destination),
            handler: 'CacheFirst',
            options: {
              cacheName: 'analyst-pro-assets',
              expiration: { maxEntries: 120, maxAgeSeconds: 60 * 60 * 24 * 30 }
            }
          }
        ]
      }
    })
  ],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts'],
    globals: true,
    css: true,
    exclude: ['node_modules/**', 'dist/**', 'src/tests/e2e/**']
  }
};

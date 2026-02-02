import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'GèreTonDjai',
        short_name: 'GèreTonDjai',
        description: 'Gère ton argent comme un boss, en Nouchi !',
        theme_color: '#f48c25',
        background_color: '#f8f7f5',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.svg',
            sizes: '192x192',
            type: 'image/svg+xml'
          },
          {
            src: 'pwa-512x512.svg',
            sizes: '512x512',
            type: 'image/svg+xml'
          },
          {
            src: 'pwa-512x512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  build: {
    // Code splitting optimisé
    rollupOptions: {
      output: {
        manualChunks: {
          // Séparer les grandes bibliothèques
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'framer-motion': ['framer-motion'],
          'supabase': ['@supabase/supabase-js'],
          'utils': ['dexie', 'zustand'],
          'pdf': ['jspdf', 'jspdf-autotable']
        },
        // Optimiser les noms de chunks pour le cache
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    // Optimisations de build
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Supprimer console.log en production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug']
      }
    },
    // Augmenter la limite de warning pour les chunks
    chunkSizeWarningLimit: 600,
    // Optimiser les assets
    assetsInlineLimit: 4096, // Inline les petits assets (<4KB)
    cssCodeSplit: true,
    sourcemap: false // Désactiver les sourcemaps en production pour réduire la taille
  },
  // Optimisations pour le développement
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
    exclude: ['framer-motion'] // Charger dynamiquement
  }
})

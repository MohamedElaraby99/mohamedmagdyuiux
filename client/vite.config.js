import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'import.meta.env.VITE_REACT_APP_API_URL': JSON.stringify(
      process.env.NODE_ENV === 'production'
        ? 'https://api.magdyacademy.com/api/v1'
        : (process.env.VITE_REACT_APP_API_URL || 'http://localhost:4095/api/v1')
    )
  },
  build: {
    // Enable minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true
      }
    },
    // Optimize chunk splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks - separate large libraries
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'redux-vendor': ['@reduxjs/toolkit', 'react-redux'],
          'ui-vendor': ['react-icons', 'react-hot-toast'],
          'chart-vendor': ['chart.js', 'react-chartjs-2'],
        }
      }
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // Enable source maps for debugging (disable in production if needed)
    sourcemap: false,
  },
  // Optimize dev server
  server: {
    hmr: {
      overlay: false // Disable error overlay for faster dev
    }
  },
  // Optimize dependency pre-bundling
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@reduxjs/toolkit',
      'react-redux',
      'axios',
      'react-icons/fa',
      'react-hot-toast'
    ]
  }
})

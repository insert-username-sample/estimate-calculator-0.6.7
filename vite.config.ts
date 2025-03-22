import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  define: {
    'process.env': {}
  },
  plugins: [react()],
  base: './',
  assetsInclude: ['**/*.PNG', '**/*.png'],
  publicDir: 'public',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    emptyOutDir: true,
    reportCompressedSize: true,
    // Removed reportBrotliSize as it's not a valid BuildOptions property
    sourcemap: false,
    minify: 'terser',
    chunkSizeWarningLimit: 1000,
    target: 'esnext',
    outDir: 'dist',
    assetsDir: 'assets',
    cssCodeSplit: true,
    rollupOptions: {
      treeshake: true,
      input: path.resolve(__dirname, 'index.html'),
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['lucide-react'],
          pdf: ['jspdf', 'jspdf-autotable', 'html2pdf.js'],
        },
        assetFileNames: 'assets/[name].[hash].[ext]',
        chunkFileNames: 'assets/[name].[hash].js',
        entryFileNames: 'assets/[name].[hash].js',
      },
    },
  },
  server: {
    port: 3000,
    host: true,
  },
});

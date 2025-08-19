import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@radix-ui')) {
              return 'radix-ui-components';
            }
            if (id.includes('react-hook-form')) {
              return 'react-hook-form';
            }
            if (id.includes('react-router') || id.includes('react-router-dom')) {
              return 'react-router';
            }
            if (id.includes('react-query')) {
              return 'react-query';
            }
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react';
            }
            return 'vendor';
          }
        },
      },
    },
  },
}));

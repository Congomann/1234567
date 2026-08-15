import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // Load env from the backend directory where we moved it
    const env = loadEnv(mode, path.resolve(__dirname, 'backend'), '');
    return {
      root: path.resolve(__dirname),
      server: {
        port: Number(process.env.PORT) || 3020,
        host: '127.0.0.1',
        fs: {
          strict: true,
          allow: [path.resolve(__dirname)],
        },
        proxy: {
          '/api': {
            target: `http://127.0.0.1:3001`,
            changeOrigin: true,
            secure: false,
          },
          '/ws': {
            target: 'ws://localhost:3001',
            ws: true,
          }
        }
      },
      optimizeDeps: {
        include: ['lucide-react', 'framer-motion', 'date-fns']
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        outDir: 'dist',
        sourcemap: false,
        chunkSizeWarningLimit: 2000,
        rollupOptions: {}
      }
    };
});

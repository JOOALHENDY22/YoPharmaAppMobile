import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: true,
    port: 5174,
    proxy: {
      '/api': 'http://localhost:5050'
    }
  },
  plugins: [
    react(),
    {
      name: 'apk-mime-type',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url && req.url.startsWith('/yopharma.apk')) {
            res.setHeader('Content-Type', 'application/vnd.android.package-archive');
            res.setHeader('Content-Disposition', 'attachment; filename="YoPharma.apk"');
          }
          next();
        });
      }
    }
  ]
})

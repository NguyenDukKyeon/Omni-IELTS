import { defineConfig } from 'vite';
import { apiHandler } from './server/server.mjs';

export default defineConfig({
  appType: 'spa',
  plugins: [
    {
      name: 'api-server-middleware',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (req.url && req.url.startsWith('/api/')) {
            await apiHandler(req, res, next);
          } else {
            next();
          }
        });
      }
    }
  ],
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    allowedHosts: true,
    headers: {
      'Cache-Control': 'no-store'
    }
  },
  preview: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    allowedHosts: true,
    headers: {
      'Cache-Control': 'no-store'
    }
  }
});


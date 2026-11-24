import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fetchAllCosmeticsNews } from './lib/rss-core.mjs';

function localRssApiPlugin() {
  return {
    name: 'local-rss-api',
    configureServer(server) {
      server.middlewares.use('/api/rss', async (_req, res) => {
        try {
          const payload = await fetchAllCosmeticsNews({ maxItems: 42 });
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify(payload));
        } catch (err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({ error: err?.message || 'Erro no RSS local' }));
        }
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), localRssApiPlugin()]
});

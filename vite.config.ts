import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { handleApiRequest } from './shared/api';

/**
 * Obsluhuje `/api/dluh` i v `npm run dev`. Na Vercelu tutéž funkci volá
 * serverless endpoint v `api/dluh.ts`.
 */
function devApi(): Plugin {
  return {
    name: 'statni-dluh-dev-api',
    configureServer(server) {
      server.middlewares.use('/api/dluh', (req, res) => {
        const url = new URL(req.url ?? '/', 'http://localhost');
        const { status, headers, body } = handleApiRequest(url);
        res.writeHead(status, headers);
        res.end(body);
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), devApi()],
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      // Dvě samostatné stránky. Informační nemá vlastní aplikační kód,
      // její vstup jen připojí styly — obsah se vykresluje při buildu.
      input: {
        index: 'index.html',
        informace: 'informace.html',
      },
    },
  },
});

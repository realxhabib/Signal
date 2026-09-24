import { defineConfig, loadEnv } from 'vite';
import { handleJev } from './server/jevProxy.ts';

export default defineConfig(({ mode }) => {
  // Make TYPESAFE_API_KEY from .env visible to the server-side proxy only.
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''));
  return {
    plugins: [
      {
        name: 'jev-proxy',
        configureServer(server) {
          // Exact match only: the client also imports the module file /api/jev.ts.
          server.middlewares.use((req, res, next) => (req.url?.split('?')[0] === '/api/jev' ? void handleJev(req, res) : next()));
        },
      },
    ],
  };
});

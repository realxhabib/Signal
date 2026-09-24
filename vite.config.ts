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
          server.middlewares.use('/api/jev', (req, res) => void handleJev(req, res));
        },
      },
    ],
  };
});

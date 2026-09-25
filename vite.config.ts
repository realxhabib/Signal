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
          // Local run of the alerts endpoint (on Vercel it runs as a cron function).
          server.middlewares.use(async (req, res, next) => {
            if (req.url?.split('?')[0] !== '/api/alerts') return next();
            const { GET } = await server.ssrLoadModule('/api/alerts.ts');
            const out: Response = await GET(new Request(`http://localhost${req.url}`, { headers: req.headers as HeadersInit }));
            res.statusCode = out.status;
            res.setHeader('Content-Type', 'application/json');
            res.end(await out.text());
          });
        },
      },
    ],
  };
});

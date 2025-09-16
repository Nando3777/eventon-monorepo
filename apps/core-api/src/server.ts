import Fastify from 'fastify';
import swagger from '@fastify/swagger';
import { boot } from './boot';
import healthRoutes from './routes/health';
import tenantRequestIdPlugin from './plugins/tenant-request-id';

export async function buildServer() {
  boot();
  const app = Fastify({
    logger: true,
  });

  await app.register(tenantRequestIdPlugin);

  await app.register(swagger, {
    openapi: {
      info: {
        title: 'EventOn Core API',
        description: 'Core API surface for EventOn services',
        version: '0.1.0',
      },
      servers: [
        {
          url: 'http://localhost:3000',
          description: 'Local development',
        },
      ],
    },
  });

  await app.register(healthRoutes);

  app.get('/docs', async () => app.swagger());

  return app;
}

export async function start() {
  const app = await buildServer();
  const port = Number.parseInt(process.env.PORT ?? '3000', 10);
  const host = process.env.HOST ?? '0.0.0.0';

  try {
    await app.listen({ port, host });
    app.log.info({ host, port }, 'Core API listening');
  } catch (error) {
    app.log.error(error, 'Failed to start core API');
    process.exit(1);
  }
}

if (require.main === module) {
  start();
}

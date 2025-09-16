import { FastifyPluginAsync } from 'fastify';

const healthRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/healthz', {
    schema: {
      tags: ['health'],
      summary: 'Health check',
      response: {
        200: {
          description: 'Service is healthy',
          type: 'object',
          properties: {
            status: { type: 'string' }
          },
          required: ['status']
        }
      }
    }
  }, async () => ({ status: 'ok' }));

  fastify.get('/readyz', {
    schema: {
      tags: ['health'],
      summary: 'Readiness check',
      response: {
        200: {
          description: 'Service is ready',
          type: 'object',
          properties: {
            status: { type: 'string' }
          },
          required: ['status']
        }
      }
    }
  }, async () => ({ status: 'ready' }));
};

export default healthRoutes;

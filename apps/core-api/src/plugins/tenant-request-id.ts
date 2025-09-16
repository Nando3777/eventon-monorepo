import fp from 'fastify-plugin';
import { randomUUID } from 'node:crypto';
import { FastifyPluginAsync } from 'fastify';

declare module 'fastify' {
  interface FastifyRequest {
    tenantRequestId: string;
  }
}

const tenantRequestIdPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('onRequest', (request, reply, done) => {
    const header = request.headers['x-tenant-id'];
    const tenantId = Array.isArray(header)
      ? header[0]
      : header ?? 'public';
    const tenant = typeof tenantId === 'string' && tenantId.trim().length > 0 ? tenantId.trim() : 'public';
    const tenantRequestId = `${tenant}:${randomUUID()}`;

    request.tenantRequestId = tenantRequestId;
    reply.header('x-tenant-request-id', tenantRequestId);
    done();
  });
};

export default fp(tenantRequestIdPlugin, {
  name: 'tenant-request-id',
});

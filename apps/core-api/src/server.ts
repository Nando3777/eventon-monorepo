import Fastify from 'fastify';
import helmet from '@fastify/helmet';
import cors from '@fastify/cors';
import { PrismaClient } from '@prisma/client';

const app = Fastify({ logger: true });
await app.register(helmet);
await app.register(cors, { origin: true });

const prisma = new PrismaClient();

app.get('/health', async () => ({ ok: true }));

app.get('/tenants', async () => prisma.tenant.findMany());

app.post('/tenants', async (req, reply) => {
  const body = req.body as { name?: string };
  if (!body?.name) return reply.code(400).send({ error: 'name required' });
  const t = await prisma.tenant.create({ data: { name: body.name } });
  return reply.code(201).send(t);
});

const port = Number(process.env.PORT || 8080);
app.listen({ port, host: '0.0.0.0' });

import { Redis } from '@upstash/redis';
import type { WhatsAppJobData } from '@/types';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export { redis };

// Fila simples com Upstash (sem BullMQ para simplificar no MVP)
// Em produção, migrar para BullMQ com Upstash Redis

const QUEUE_KEY = 'vettrack:whatsapp:queue';

export async function enqueueWhatsApp(data: WhatsAppJobData): Promise<void> {
  await redis.lpush(QUEUE_KEY, JSON.stringify({
    ...data,
    createdAt: new Date().toISOString(),
    attempts: 0,
  }));
}

export async function dequeueWhatsApp(): Promise<(WhatsAppJobData & { createdAt: string; attempts: number }) | null> {
  const raw = await redis.rpop(QUEUE_KEY);
  if (!raw) return null;
  return typeof raw === 'string' ? JSON.parse(raw) : raw;
}

export async function getQueueLength(): Promise<number> {
  return redis.llen(QUEUE_KEY);
}

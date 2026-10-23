import Redis from 'ioredis';

const mem = new Map<string, { v: string; exp: number }>();
let client: Redis | null = null;

function r() {
  if (!process.env.REDIS_URL) return null;
  if (!client) {
    client = new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: 2, lazyConnect: false });
    client.on('error', () => {});
  }
  return client;
}

export async function cacheGet(key: string): Promise<any | null> {
  try {
    const c = r();
    if (c) {
      const v = await c.get(key);
      return v ? JSON.parse(v) : null;
    }
  } catch {}
  const m = mem.get(key);
  if (m && m.exp > Date.now()) return JSON.parse(m.v);
  return null;
}

export async function cacheSet(key: string, value: any, ttlSec: number) {
  const s = JSON.stringify(value);
  try {
    const c = r();
    if (c) return void (await c.set(key, s, 'EX', ttlSec));
  } catch {}
  mem.set(key, { v: s, exp: Date.now() + ttlSec * 1000 });
}

/** Fixed-window rate limit. Returns true if allowed. */
export async function rateLimit(ip: string, limit = 30, windowSec = 60) {
  const key = `rl:${ip}:${Math.floor(Date.now() / (windowSec * 1000))}`;
  try {
    const c = r();
    if (c) {
      const n = await c.incr(key);
      if (n === 1) await c.expire(key, windowSec);
      return n <= limit;
    }
  } catch {}
  const m = mem.get(key);
  const n = (m ? parseInt(m.v) : 0) + 1;
  mem.set(key, { v: String(n), exp: Date.now() + windowSec * 1000 });
  return n <= limit;
}

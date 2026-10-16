---
name: redis-cache-patterns
description: >-
  Implements enterprise Redis caching strategies (cache-aside, write-through, stale-while-revalidate), distributed locking (Redlock), sliding-window rate limiting, and pub/sub streams.
---

# Redis Cache Patterns & Distributed Primitives

This skill provides production-tested patterns for high-throughput Redis caching, concurrency coordination, and resilient distributed systems.

---

## 🚀 Key Patterns

### 1. Cache-Aside with Jitter (Preventing Cache Stampedes)

When calculating TTLs, always inject jitter (random variance) to prevent simultaneous mass-expiration of keys:

```typescript
import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL!);

export async function getCachedEntity<T>(
  key: string,
  fetchFn: () => Promise<T>,
  baseTtlSeconds: number = 3600
): Promise<T> {
  const cached = await redis.get(key);
  if (cached) {
    return JSON.parse(cached) as T;
  }

  const freshData = await fetchFn();
  
  // Inject 10-15% random jitter to distribute TTL expiration spikes
  const jitter = Math.floor(Math.random() * (baseTtlSeconds * 0.15));
  const ttl = baseTtlSeconds + jitter;

  await redis.set(key, JSON.stringify(freshData), 'EX', ttl);
  return freshData;
}
```

---

### 2. Distributed Locking with Safe Lua Release

Never release a Redis lock with a plain `DEL` command, as doing so can accidentally delete a lock held by another process if the operation took longer than the TTL. Use atomic Lua verification:

```typescript
import { randomUUID } from 'crypto';

const RELEASE_LOCK_SCRIPT = `
  if redis.call("get", KEYS[1]) == ARGV[1] then
    return redis.call("del", KEYS[1])
  else
    return 0
  end
`;

export async function withDistributedLock<T>(
  lockKey: string,
  ttlMs: number,
  task: () => Promise<T>
): Promise<T> {
  const lockToken = randomUUID();
  const acquired = await redis.set(lockKey, lockToken, 'PX', ttlMs, 'NX');

  if (!acquired) {
    throw new Error(`Failed to acquire distributed lock for key: ${lockKey}`);
  }

  try {
    return await task();
  } finally {
    // Atomically release only if the token matches
    await redis.eval(RELEASE_LOCK_SCRIPT, 1, lockKey, lockToken);
  }
}
```

---

### 3. Sliding-Window Rate Limiting (Sorted Sets)

Sliding-window rate limiters prevent burst exploitation around window boundaries:

```typescript
export async function isRateLimited(
  identifier: string,
  limit: number,
  windowSeconds: number
): Promise<{ allowed: boolean; remaining: number }> {
  const now = Date.now();
  const clearBefore = now - windowSeconds * 1000;
  const key = `ratelimit:${identifier}`;

  const pipeline = redis.pipeline();
  pipeline.zremrangebyscore(key, 0, clearBefore);
  pipeline.zadd(key, now, `${now}-${Math.random()}`);
  pipeline.zcard(key);
  pipeline.expire(key, windowSeconds);

  const results = await pipeline.exec();
  const count = (results?.[2]?.[1] as number) || 0;

  return {
    allowed: count <= limit,
    remaining: Math.max(0, limit - count),
  };
}
```

---

### 4. Redis Streams with Consumer Groups

For reliable, decoupled background tasks without message loss:

```typescript
// Producer: Append event to stream
export async function publishEvent(streamName: string, event: Record<string, string>) {
  return await redis.xadd(streamName, '*', ...Object.entries(event).flat());
}

// Consumer: Read events with acknowledgments
export async function consumeEvents(
  streamName: string,
  groupName: string,
  consumerName: string,
  handler: (id: string, fields: string[]) => Promise<void>
) {
  const response = await redis.xreadgroup(
    'GROUP', groupName, consumerName,
    'COUNT', 10,
    'BLOCK', 2000,
    'STREAMS', streamName, '>'
  );

  if (!response) return;

  for (const [, messages] of response as any[]) {
    for (const [id, fields] of messages) {
      await handler(id, fields);
      // Acknowledge processed message
      await redis.xack(streamName, groupName, id);
    }
  }
}
```

---

### 5. Memory & Performance Best Practices

- **Structured Namespaces**: Use colons for domain hierarchy (e.g., `user:1042:profile`, `session:tok_9918`).
- **Use Hashes for Objects**: Storing small objects in Redis `HSET` saves ~40% memory compared to JSON strings due to memory-efficient `ziplist`/`listpack` encodings.
- **Always Configure Eviction Policy**: In `redis.conf`, set `maxmemory-policy volatile-lru` or `allkeys-lru` to avoid hard out-of-memory errors.

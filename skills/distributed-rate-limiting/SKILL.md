---
name: distributed-rate-limiting
description: >-
  Architects, implements, and tunes distributed rate limiting using Redis sliding window logs, token buckets, tiered API quotas, RFC 6585 headers, and circuit breakers.
---

# Distributed Rate Limiting & API Traffic Shaping

This skill guides the design, implementation, and tuning of distributed rate limiting systems across microservice clusters using Redis, token buckets, and sliding window algorithms.

---

## ⚡ Algorithm Comparison Matrix

| Algorithm | Precision | Memory Usage | Burst Handling | Best For |
| :--- | :--- | :--- | :--- | :--- |
| **`Sliding Window Log`** | 100% Exact | High ($O(N)$ requests) | Excellent | Low-to-medium traffic sensitive endpoints (auth, payments). |
| **`Sliding Window Counter`**| ~99% Exact | Fixed ($O(1)$) | Smooth | High-scale public APIs and ingress gateways. |
| **`Token Bucket`** | High | Very Low ($O(1)$) | Controlled bursts | Standard microservice backpressuring and rate smoothing. |
| **`Fixed Window`** | Poor (2x burst at boundary) | Lowest | Prone to spikes | Simple non-critical background jobs only. |

---

## 🔒 Atomic Sliding Window Rate Limiter (Redis Lua)

Atomic execution in Redis ensures no race conditions across distributed API instances:

```lua
-- sliding_window.lua
-- KEYS[1]: Rate limit key (e.g., "ratelimit:tenant_123:orders")
-- ARGV[1]: Current UNIX timestamp in milliseconds
-- ARGV[2]: Window size in milliseconds (e.g., 60000 for 1 minute)
-- ARGV[3]: Maximum allowed requests in window (e.g., 100)

local key = KEYS[1]
local now = tonumber(ARGV[1])
local window = tonumber(ARGV[2])
local limit = tonumber(ARGV[3])
local clearBefore = now - window

-- 1. Remove expired request timestamps outside the window
redis.call('ZREMRANGEBYSCORE', key, 0, clearBefore)

-- 2. Count requests currently in the sliding window
local currentRequests = redis.call('ZCARD', key)

if currentRequests < limit then
    -- 3. Register current request with unique timestamp as score and member
    redis.call('ZADD', key, now, now .. '-' .. math.random(1000, 9999))
    redis.call('PEXPIRE', key, window)
    return { 1, limit - currentRequests - 1, 0 } -- [Allowed: 1, Remaining, RetryAfter: 0]
else
    -- 4. Calculate time until oldest entry expires
    local oldest = redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')
    local retryAfter = math.ceil((tonumber(oldest[2]) + window - now) / 1000)
    return { 0, 0, math.max(1, retryAfter) }      -- [Allowed: 0, Remaining: 0, RetryAfter]
end
```

---

## 🌐 Express / Fastify / Node.js Middleware Implementation

Wrap Redis Lua execution into production middleware with RFC 6585 compliance:

```typescript
import { Request, Response, NextFunction } from 'express';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

export function createRateLimiter(options: { windowMs: number; max: number; keyGenerator?: (req: Request) => string }) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const key = options.keyGenerator ? options.keyGenerator(req) : `ratelimit:${req.ip}`;
    const now = Date.now();

    try {
      const [allowed, remaining, retryAfter] = await redis.eval(
        SLIDING_WINDOW_LUA_SCRIPT,
        1,
        key,
        now.toString(),
        options.windowMs.toString(),
        options.max.toString()
      ) as [number, number, number];

      // Set standard RFC 6585 RateLimit response headers
      res.setHeader('X-RateLimit-Limit', options.max);
      res.setHeader('X-RateLimit-Remaining', remaining);
      res.setHeader('X-RateLimit-Reset', Math.ceil((now + options.windowMs) / 1000));

      if (allowed === 1) {
        return next();
      }

      res.setHeader('Retry-After', retryAfter);
      return res.status(429).json({
        error: 'Too Many Requests',
        message: `Rate limit exceeded. Please retry after ${retryAfter} seconds.`,
        retryAfter,
      });
    } catch (err) {
      // Circuit Breaker: Fail-Open for high availability if Redis degrades
      console.error('RateLimiter Redis failure, failing open:', err);
      return next();
    }
  };
}
```

---

## 🎯 Tiered Multi-Dimensional Quotas

Configure tiered rate limits based on authenticated API keys and endpoint criticality:

```typescript
export function getTierLimits(tier: 'free' | 'pro' | 'enterprise') {
  switch (tier) {
    case 'enterprise':
      return { windowMs: 60_000, max: 10_000 };
    case 'pro':
      return { windowMs: 60_000, max: 1_200 };
    case 'free':
    default:
      return { windowMs: 60_000, max: 60 };
  }
}
```

---

## 📋 Architectural Rules & Best Practices

1. **Atomic Scripts**: Never implement rate limiters with separated `GET` and `INCR` commands; always execute atomic Lua scripts or Redis Transactions (`MULTI/EXEC`) to prevent race conditions under load.
2. **Fail-Open Strategy**: For user-facing critical flows, catch Redis connection timeouts and fail-open with alerting rather than causing total service outages.
3. **Multi-Dimensional Keys**: Combine client identity with endpoint routes (e.g. `tenant:123:POST:/api/v1/checkout`) to prevent denial of service on high-cost endpoints.
4. **Header Standards**: Always emit `Retry-After`, `X-RateLimit-Limit`, and `X-RateLimit-Remaining` to allow compliant clients to back off exponentially.

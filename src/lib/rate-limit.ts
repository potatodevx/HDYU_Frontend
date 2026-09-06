/**
 * Lightweight in-memory sliding-window rate limiter.
 * Suitable for a single Node instance; for multi-instance production
 * deployments swap the store for Redis (e.g. Upstash) — the call sites
 * do not need to change.
 */
type Bucket = { count: number; resetAt: number };

const store = new Map<string, Bucket>();

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = store.get(key);
  if (!bucket || bucket.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= limit) return false;
  bucket.count += 1;
  return true;
}

// Periodically drop expired buckets so the map doesn't grow unbounded.
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of store) {
    if (bucket.resetAt < now) store.delete(key);
  }
}, 60_000).unref?.();

export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  return fwd ? fwd.split(",")[0].trim() : "unknown";
}

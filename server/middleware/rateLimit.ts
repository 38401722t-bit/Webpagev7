import { Request, Response, NextFunction } from "express";

interface RateLimitOptions {
  windowMs: number;
  max: number;
  message?: string;
  code?: string;
}

interface ClientRecord {
  count: number;
  resetTime: number;
}

export function createRateLimiter(options: RateLimitOptions) {
  const clients = new Map<string, ClientRecord>();
  const windowMs = options.windowMs;
  const max = options.max;
  const message = options.message || "Too many requests. Please try again later.";
  const code = options.code || "RATE_LIMIT_EXCEEDED";

  // Periodic cleanup of stale entries every 2 minutes
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of clients.entries()) {
      if (now > record.resetTime) {
        clients.delete(key);
      }
    }
  }, 120000);

  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || "anonymous";
    const user = (req as any).user;
    const identifier = user ? `user:${user.id}` : `ip:${ip}`;
    const now = Date.now();

    let record = clients.get(identifier);
    if (!record || now > record.resetTime) {
      record = { count: 1, resetTime: now + windowMs };
      clients.set(identifier, record);
    } else {
      record.count++;
    }

    res.setHeader("X-RateLimit-Limit", max);
    res.setHeader("X-RateLimit-Remaining", Math.max(0, max - record.count));
    res.setHeader("X-RateLimit-Reset", Math.ceil(record.resetTime / 1000));

    if (record.count > max) {
      return res.status(429).json({
        success: false,
        detail: message,
        error: {
          code,
          message,
          retryAfterSeconds: Math.ceil((record.resetTime - now) / 1000),
        },
      });
    }

    next();
  };
}

// Pre-configured rate limiters for distinct workload tiers
export const authRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 15,
  message: "Too many authentication attempts. Please wait 1 minute before trying again.",
  code: "AUTH_RATE_LIMIT",
});

export const searchRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 120,
  message: "Search query limit reached. Please slow down.",
  code: "SEARCH_RATE_LIMIT",
});

export const aiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 30,
  message: "TripPilot AI request limit reached. Please wait a moment.",
  code: "AI_RATE_LIMIT",
});

export const imageRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 60,
  message: "Image search limit reached.",
  code: "IMAGE_RATE_LIMIT",
});

export const routeRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 60,
  message: "Route calculation limit reached.",
  code: "ROUTE_RATE_LIMIT",
});

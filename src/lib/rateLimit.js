// Simple in-memory rate limiter (per IP + global)
const ipRequests = new Map();
const globalCounters = new Map();

const CLEANUP_INTERVAL = 60 * 1000;

setInterval(() => {
  const now = Date.now();
  for (const [key, data] of ipRequests) {
    if (now - data.windowStart > data.windowMs) {
      ipRequests.delete(key);
    }
  }
  for (const [key, data] of globalCounters) {
    if (now - data.windowStart > data.windowMs) {
      globalCounters.delete(key);
    }
  }
}, CLEANUP_INTERVAL);

/**
 * Rate limit by IP address
 * @param {Request} request
 * @param {object} options
 * @param {number} options.limit - max requests per IP per window
 * @param {number} options.windowMs - time window in ms
 * @param {string} options.prefix - key prefix for different endpoints
 * @param {number} options.globalLimit - max total requests across all IPs per window (0 = no limit)
 * @param {number} options.globalWindowMs - global window in ms
 * @returns {{ success: boolean, remaining: number, reason?: string }}
 */
export function rateLimit(request, {
  limit = 10,
  windowMs = 60000,
  prefix = '',
  globalLimit = 0,
  globalWindowMs = 3600000,
} = {}) {
  const now = Date.now();

  // Global limit check
  if (globalLimit > 0) {
    const gKey = `global:${prefix}`;
    const gEntry = globalCounters.get(gKey);

    if (!gEntry || now - gEntry.windowStart > globalWindowMs) {
      globalCounters.set(gKey, { count: 1, windowStart: now, windowMs: globalWindowMs });
    } else if (gEntry.count >= globalLimit) {
      return { success: false, remaining: 0, reason: 'global' };
    } else {
      gEntry.count++;
    }
  }

  // Per-IP limit check
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
  const key = `${prefix}:${ip}`;

  const entry = ipRequests.get(key);

  if (!entry || now - entry.windowStart > windowMs) {
    ipRequests.set(key, { count: 1, windowStart: now, windowMs });
    return { success: true, remaining: limit - 1 };
  }

  if (entry.count >= limit) {
    return { success: false, remaining: 0, reason: 'ip' };
  }

  entry.count++;
  return { success: true, remaining: limit - entry.count };
}

/**
 * Validate request origin — only allow from our own domain
 * @param {Request} request
 * @returns {boolean}
 */
export function validateOrigin(request) {
  const origin = request.headers.get('origin') || '';
  const referer = request.headers.get('referer') || '';

  const allowedHosts = [
    'youraislopboresmegame.com',
    'www.youraislopboresmegame.com',
    'localhost',
    '127.0.0.1',
  ];

  const check = (url) => {
    try {
      const host = new URL(url).hostname;
      return allowedHosts.some(h => host === h || host.endsWith('.' + h));
    } catch {
      return false;
    }
  };

  // At least one must match
  if (origin && check(origin)) return true;
  if (referer && check(referer)) return true;

  // If neither header present (e.g. server-side), block it
  return false;
}

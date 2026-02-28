// ============================================================
// Rate Limiting
// ============================================================

export class RateLimiter {
  private windows: Map<string, { count: number; resetAt: number }> = new Map();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number = 60, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  /** Check if a request should be allowed */
  check(key: string): boolean {
    const now = Date.now();
    let window = this.windows.get(key);

    if (!window || now > window.resetAt) {
      window = { count: 0, resetAt: now + this.windowMs };
      this.windows.set(key, window);
    }

    window.count++;
    return window.count <= this.maxRequests;
  }

  /** Get remaining requests for a key */
  remaining(key: string): number {
    const window = this.windows.get(key);
    if (!window || Date.now() > window.resetAt) return this.maxRequests;
    return Math.max(0, this.maxRequests - window.count);
  }

  /** Clean up expired windows */
  cleanup(): void {
    const now = Date.now();
    for (const [key, window] of this.windows) {
      if (now > window.resetAt) {
        this.windows.delete(key);
      }
    }
  }
}

export const rateLimiter = new RateLimiter();

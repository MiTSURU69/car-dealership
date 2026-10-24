import rateLimit from 'express-rate-limit';

interface LimiterOptions {
  /** Length of the counting window, in milliseconds. */
  windowMs: number;
  /** How many requests one IP may make inside the window. */
  max: number;
}

/** Builds a limiter that answers 429 with a JSON error once an IP goes over its allowance. */
export function createRateLimiter({ windowMs, max }: LimiterOptions) {
  return rateLimit({
    windowMs,
    limit: max,
    standardHeaders: 'draft-7', // sends RateLimit headers so clients know where they stand
    legacyHeaders: false,
    message: { error: 'Too many attempts, please try again later' },
  });
}
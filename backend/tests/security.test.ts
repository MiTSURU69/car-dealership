import express from 'express';
import request from 'supertest';
import { app } from '../src/app';
import { createRateLimiter } from '../src/middleware/rateLimiter';

describe('security headers', () => {
  it('sends helmet headers', async () => {
    const res = await request(app).get('/api/health');

    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['strict-transport-security']).toBeDefined();
  });

  it('does not advertise the framework', async () => {
    const res = await request(app).get('/api/health');
    expect(res.headers['x-powered-by']).toBeUndefined();
  });
});

describe('createRateLimiter', () => {
  /** A tiny app with one route, so the limiter is tested on its own. */
  function appWithLimit(max: number) {
    const small = express();
    small.use(createRateLimiter({ windowMs: 60_000, max }));
    small.get('/ping', (_req, res) => res.json({ ok: true }));
    return small;
  }

  it('allows requests up to the limit, then answers 429', async () => {
    const small = appWithLimit(3);

    for (let i = 0; i < 3; i++) {
      expect((await request(small).get('/ping')).status).toBe(200);
    }
    const blocked = await request(small).get('/ping');

    expect(blocked.status).toBe(429);
    expect(blocked.body.error).toMatch(/too many/i);
  });

  it('tells the client how many requests are left', async () => {
    const res = await request(appWithLimit(5)).get('/ping');
    expect(res.headers['ratelimit']).toBeDefined();
  });
});
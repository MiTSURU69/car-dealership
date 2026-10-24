import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../src/app';
import { prisma } from '../src/db';
import { requireAdmin } from '../src/middleware/authMiddleware';
import { AppError } from '../src/errors/AppError';

describe('authenticate (via GET /api/auth/me)', () => {
  const credentials = { email: 'asha@example.com', password: 'Password123' };

  beforeEach(async () => {
    await prisma.user.deleteMany();
    await request(app).post('/api/auth/register').send({ name: 'Asha', ...credentials });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('rejects a request with no token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('rejects a garbage token', async () => {
    const res = await request(app).get('/api/auth/me').set('Authorization', 'Bearer not-a-real-token');
    expect(res.status).toBe(401);
  });

  it('rejects an expired token', async () => {
    const expired = jwt.sign({ userId: 1, role: 'user' }, 'test-secret', { expiresIn: -10 });
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${expired}`);
    expect(res.status).toBe(401);
  });

  it('returns the current user for a valid token', async () => {
    const login = await request(app).post('/api/auth/login').send(credentials);
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${login.body.token}`);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('asha@example.com');
  });
});

describe('requireAdmin', () => {
  /** Runs the middleware with a fake response and returns whatever it passed to next(). */
  function run(user?: { userId: number; role: string }) {
    const res = { locals: { user } } as any;
    const next = jest.fn();
    requireAdmin({} as any, res, next);
    return next.mock.calls[0][0];
  }

  it('lets an admin through', () => {
    expect(run({ userId: 1, role: 'admin' })).toBeUndefined();
  });

  it('blocks a regular user with 403', () => {
    const error = run({ userId: 2, role: 'user' });
    expect(error).toBeInstanceOf(AppError);
    expect(error.statusCode).toBe(403);
  });

  it('blocks a request with no user with 403', () => {
    expect(run(undefined).statusCode).toBe(403);
  });
});
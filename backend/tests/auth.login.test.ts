import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../src/app';
import { prisma } from '../src/db';

describe('POST /api/auth/login', () => {
  const credentials = { email: 'asha@example.com', password: 'Password123' };

  beforeEach(async () => {
    await prisma.user.deleteMany();
    await request(app).post('/api/auth/register').send({ name: 'Asha', ...credentials });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('returns a token and the public user for valid credentials', async () => {
    const res = await request(app).post('/api/auth/login').send(credentials);

    expect(res.status).toBe(200);
    expect(typeof res.body.token).toBe('string');
    expect(res.body.user).toMatchObject({ email: 'asha@example.com', role: 'user' });
    expect(res.body.user.passwordHash).toBeUndefined();
  });

  it('puts the user id and role inside the token', async () => {
    const res = await request(app).post('/api/auth/login').send(credentials);

    const decoded = jwt.verify(res.body.token, 'test-secret') as jwt.JwtPayload;
    expect(decoded.userId).toBe(res.body.user.id);
    expect(decoded.role).toBe('user');
  });

  it('rejects a wrong password with 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ ...credentials, password: 'WrongPassword1' });

    expect(res.status).toBe(401);
  });

  it('rejects an unknown email with 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'Password123' });

    expect(res.status).toBe(401);
  });

  it('rejects missing fields with 400', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: credentials.email });

    expect(res.status).toBe(400);
  });
});
import request from 'supertest';
import { app } from '../src/app';
import { prisma } from '../src/db';

describe('POST /api/auth/register', () => {
  const validUser = {
    name: 'Asha',
    email: 'asha@example.com',
    password: 'Password123',
  };

  beforeEach(async () => {
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('creates a user and does not expose the password', async () => {
    const res = await request(app).post('/api/auth/register').send(validUser);

    expect(res.status).toBe(201);
    expect(res.body.user).toMatchObject({
      name: 'Asha',
      email: 'asha@example.com',
      role: 'user',
    });
    expect(res.body.user.id).toBeDefined();
    expect(res.body.user.password).toBeUndefined();
    expect(res.body.user.passwordHash).toBeUndefined();
  });

  it('stores a hashed password, not the plain text', async () => {
    await request(app).post('/api/auth/register').send(validUser);

    const stored = await prisma.user.findUnique({ where: { email: validUser.email } });
    expect(stored).not.toBeNull();
    expect(stored!.passwordHash).not.toBe(validUser.password);
  });

  it('rejects a duplicate email with 409', async () => {
    await request(app).post('/api/auth/register').send(validUser);
    const res = await request(app).post('/api/auth/register').send(validUser);

    expect(res.status).toBe(409);
  });

  it('rejects an invalid email with 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validUser, email: 'not-an-email' });

    expect(res.status).toBe(400);
  });

  it('rejects a password shorter than 8 characters with 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validUser, password: 'short' });

    expect(res.status).toBe(400);
  });

  it('rejects a missing name with 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: validUser.email, password: validUser.password });

    expect(res.status).toBe(400);
  });
});
import bcrypt from 'bcryptjs';
import request from 'supertest';
import { app } from '../../src/app';
import { prisma } from '../../src/db';

/** Creates a user with the given role directly in the DB, logs in, and returns the JWT. */
export async function createTokenFor(role: 'user' | 'admin'): Promise<string> {
  const email = `${role}@example.com`;
  const password = 'Password123';
  const passwordHash = await bcrypt.hash(password, 4); // low cost: keeps tests fast
  await prisma.user.create({ data: { name: role, email, passwordHash, role } });

  const res = await request(app).post('/api/auth/login').send({ email, password });
  return res.body.token;
}
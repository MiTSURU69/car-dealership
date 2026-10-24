import { signToken } from './tokenService';
import bcrypt from 'bcryptjs';
import { prisma } from '../db';
import { AppError } from '../errors/AppError';


export interface PublicUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

const SALT_ROUNDS = 10;
const MIN_PASSWORD_LENGTH = 8;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Checks the raw request body and returns clean, typed values. */
function parseRegisterInput(body: any) {
  const name = typeof body?.name === 'string' ? body.name.trim() : '';
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body?.password === 'string' ? body.password : '';

  if (!name) throw new AppError(400, 'Name is required');
  if (!EMAIL_PATTERN.test(email)) throw new AppError(400, 'A valid email is required');
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new AppError(400, `Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
  }
  return { name, email, password };
}

/** Registers a new regular user. Admins are created separately (seed script). */
export async function registerUser(body: unknown): Promise<PublicUser> {
  const { name, email, password } = parseRegisterInput(body);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new AppError(409, 'Email is already registered');

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await prisma.user.create({ data: { name, email, passwordHash } });

  return { id: user.id, name: user.name, email: user.email, role: user.role };
}
/** Checks credentials and returns a signed token plus the public user. */
export async function loginUser(body: any): Promise<{ token: string; user: PublicUser }> {
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body?.password === 'string' ? body.password : '';
  if (!email || !password) throw new AppError(400, 'Email and password are required');

  const user = await prisma.user.findUnique({ where: { email } });
  const passwordMatches = user ? await bcrypt.compare(password, user.passwordHash) : false;

  // Same message for "no such user" and "wrong password" so attackers can't probe emails.
  if (!user || !passwordMatches) throw new AppError(401, 'Invalid email or password');

  const token = signToken({ userId: user.id, role: user.role });
  return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
}
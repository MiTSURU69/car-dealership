import jwt from 'jsonwebtoken';

/** The data we store inside every token. */
export interface AuthTokenPayload {
  userId: number;
  role: string;
}

const TOKEN_EXPIRY = '1d' as const;

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not set');
  return secret;
}

export function signToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, getSecret(), { expiresIn: TOKEN_EXPIRY });
}

/** Throws if the token is invalid, tampered with, or expired. */
export function verifyToken(token: string): AuthTokenPayload {
  const decoded = jwt.verify(token, getSecret());
  if (typeof decoded === 'string') throw new Error('Malformed token');
  return { userId: decoded.userId, role: decoded.role };
}
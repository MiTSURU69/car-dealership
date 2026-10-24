import { Router } from 'express';
import { login, me, register } from '../controllers/authController';
import { authenticate } from '../middleware/authMiddleware';
import { createRateLimiter } from '../middleware/rateLimiter';

export const authRoutes = Router();

// Login and register are the brute-force targets: 10 attempts per 15 minutes per IP by default.
const FIFTEEN_MINUTES = 15 * 60 * 1000;
const authLimiter = createRateLimiter({
  windowMs: FIFTEEN_MINUTES,
  max: Number(process.env.AUTH_RATE_LIMIT_MAX) || 10,
});

authRoutes.post('/register', authLimiter, register);
authRoutes.post('/login', authLimiter, login);
authRoutes.get('/me', authenticate, me);
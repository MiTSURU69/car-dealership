import { NextFunction, Request, Response } from 'express';
import { AppError } from '../errors/AppError';
import { verifyToken } from '../services/tokenService';

/** Requires a valid "Authorization: Bearer <token>" header and stores the user in res.locals. */
export function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(new AppError(401, 'Authentication required'));
  }

  try {
    res.locals.user = verifyToken(header.slice('Bearer '.length));
    next();
  } catch {
    next(new AppError(401, 'Invalid or expired token'));
  }
}

/** Must run after authenticate(). Only lets admins through. */
export function requireAdmin(_req: Request, res: Response, next: NextFunction) {
  if (res.locals.user?.role !== 'admin') {
    return next(new AppError(403, 'Admin access required'));
  }
  next();
}
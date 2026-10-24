import { NextFunction, Request, Response } from 'express';
import { registerUser } from '../services/authService';

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await registerUser(req.body);
    res.status(201).json({ user });
  } catch (err) {
    next(err);
  }
}
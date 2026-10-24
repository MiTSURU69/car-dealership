import { NextFunction, Request, Response } from 'express';
import { getCurrentUser, loginUser, registerUser } from '../services/authService';


export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await registerUser(req.body);
    res.status(201).json({ user });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await loginUser(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
export async function me(_req: Request, res: Response, next: NextFunction) {
  try {
    const user = await getCurrentUser(res.locals.user.userId);
    res.json({ user });
  } catch (err) {
    next(err);
  }
}
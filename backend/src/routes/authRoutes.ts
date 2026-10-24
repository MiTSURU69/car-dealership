import { Router } from 'express';
import { register } from '../controllers/authController';

export const authRoutes = Router();

authRoutes.post('/register', register);
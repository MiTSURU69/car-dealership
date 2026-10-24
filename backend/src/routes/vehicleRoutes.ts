import { Router } from 'express';
import { create } from '../controllers/vehicleController';
import { authenticate } from '../middleware/authMiddleware';

export const vehicleRoutes = Router();

// Every vehicle route requires a logged-in user.
vehicleRoutes.use(authenticate);

vehicleRoutes.post('/', create);
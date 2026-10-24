import { Router } from 'express';
import { create, list, search } from '../controllers/vehicleController';
import { authenticate } from '../middleware/authMiddleware';

export const vehicleRoutes = Router();

// Every vehicle route requires a logged-in user.
vehicleRoutes.use(authenticate);

vehicleRoutes.post('/', create);
vehicleRoutes.get('/', list);
// "/search" must be declared before any "/:id" route, or "search" would be read as an id.
vehicleRoutes.get('/search', search);
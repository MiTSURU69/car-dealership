import { Router } from 'express';
import { create, list, remove, search, update } from '../controllers/vehicleController';
import { authenticate, requireAdmin } from '../middleware/authMiddleware';

export const vehicleRoutes = Router();

// Every vehicle route requires a logged-in user.
vehicleRoutes.use(authenticate);

vehicleRoutes.post('/', create);
vehicleRoutes.get('/', list);
// "/search" must be declared before any "/:id" route, or "search" would be read as an id.
vehicleRoutes.get('/search', search);
vehicleRoutes.put('/:id', update);
vehicleRoutes.delete('/:id', requireAdmin, remove);
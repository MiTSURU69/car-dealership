import * as vehicleService from '../services/vehicleService';
import { asyncHandler } from '../utils/asyncHandler';

export const create = asyncHandler(async (req, res) => {
  const vehicle = await vehicleService.createVehicle(req.body);
  res.status(201).json({ vehicle });
});
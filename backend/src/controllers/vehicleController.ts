import * as vehicleService from '../services/vehicleService';
import { asyncHandler } from '../utils/asyncHandler';

export const create = asyncHandler(async (req, res) => {
  const vehicle = await vehicleService.createVehicle(req.body);
  res.status(201).json({ vehicle });
});

export const list = asyncHandler(async (_req, res) => {
  const vehicles = await vehicleService.listVehicles();
  res.json({ vehicles });
});

export const search = asyncHandler(async (req, res) => {
  const vehicles = await vehicleService.searchVehicles(req.query);
  res.json({ vehicles });
});
export const update = asyncHandler(async (req, res) => {
  const vehicle = await vehicleService.updateVehicle(req.params.id, req.body);
  res.json({ vehicle });
});
export const remove = asyncHandler(async (req, res) => {
  await vehicleService.deleteVehicle(req.params.id);
  res.status(204).send();
});
import { Vehicle } from '@prisma/client';
import { prisma } from '../db';
import { parseNewVehicle } from '../validation/vehicleValidation';

export async function createVehicle(body: unknown): Promise<Vehicle> {
  return prisma.vehicle.create({ data: parseNewVehicle(body) });
}
export async function listVehicles(): Promise<Vehicle[]> {
  return prisma.vehicle.findMany({ orderBy: { id: 'asc' } });
}
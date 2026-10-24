import { Vehicle } from '@prisma/client';
import { prisma } from '../db';
import { parseNewVehicle } from '../validation/vehicleValidation';

export async function createVehicle(body: unknown): Promise<Vehicle> {
  return prisma.vehicle.create({ data: parseNewVehicle(body) });
}
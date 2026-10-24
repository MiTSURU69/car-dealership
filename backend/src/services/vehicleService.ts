import { Prisma, Vehicle } from '@prisma/client';
import { prisma } from '../db';
import { parseNewVehicle, parseSearchQuery } from '../validation/vehicleValidation';

export async function createVehicle(body: unknown): Promise<Vehicle> {
  return prisma.vehicle.create({ data: parseNewVehicle(body) });
}
export async function listVehicles(): Promise<Vehicle[]> {
  return prisma.vehicle.findMany({ orderBy: { id: 'asc' } });
}
export async function searchVehicles(query: unknown): Promise<Vehicle[]> {
  const filters = parseSearchQuery(query);

  // Text filters match partial, case-insensitive text (SQLite's LIKE ignores ASCII case).
  const where: Prisma.VehicleWhereInput = {};
  if (filters.make) where.make = { contains: filters.make };
  if (filters.model) where.model = { contains: filters.model };
  if (filters.category) where.category = { contains: filters.category };
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    where.price = { gte: filters.minPrice, lte: filters.maxPrice };
  }

  return prisma.vehicle.findMany({ where, orderBy: { id: 'asc' } });
}
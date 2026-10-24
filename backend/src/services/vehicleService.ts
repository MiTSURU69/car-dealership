import { Prisma, Vehicle } from '@prisma/client';
import { prisma } from '../db';
import { AppError } from '../errors/AppError';
import {
  parseNewVehicle,
  parseSearchQuery,
  parseVehicleId,
  parseVehicleUpdate,
  VehicleSearchFilters,
} from '../validation/vehicleValidation';

const ORDER_BY_ID = { id: 'asc' } as const;

/**
 * Turns validated search filters into a Prisma query.
 * Text filters match partial, case-insensitive text (SQLite's LIKE ignores ASCII case).
 */
function buildSearchFilter(filters: VehicleSearchFilters): Prisma.VehicleWhereInput {
  const where: Prisma.VehicleWhereInput = {};
  if (filters.make) where.make = { contains: filters.make };
  if (filters.model) where.model = { contains: filters.model };
  if (filters.category) where.category = { contains: filters.category };
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    where.price = { gte: filters.minPrice, lte: filters.maxPrice };
  }
  return where;
}

async function getVehicleOrThrow(id: number): Promise<Vehicle> {
  const vehicle = await prisma.vehicle.findUnique({ where: { id } });
  if (!vehicle) throw new AppError(404, 'Vehicle not found');
  return vehicle;
}

export async function createVehicle(body: unknown): Promise<Vehicle> {
  return prisma.vehicle.create({ data: parseNewVehicle(body) });
}

export async function listVehicles(): Promise<Vehicle[]> {
  return prisma.vehicle.findMany({ orderBy: ORDER_BY_ID });
}

export async function searchVehicles(query: unknown): Promise<Vehicle[]> {
  const where = buildSearchFilter(parseSearchQuery(query));
  return prisma.vehicle.findMany({ where, orderBy: ORDER_BY_ID });
}

export async function updateVehicle(rawId: unknown, body: unknown): Promise<Vehicle> {
  const id = parseVehicleId(rawId);
  const data = parseVehicleUpdate(body);
  await getVehicleOrThrow(id);
  return prisma.vehicle.update({ where: { id }, data });
}

export async function deleteVehicle(rawId: unknown): Promise<void> {
  const id = parseVehicleId(rawId);
  await getVehicleOrThrow(id);
  await prisma.vehicle.delete({ where: { id } });
}
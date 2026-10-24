import { Prisma, Vehicle } from '@prisma/client';
import { prisma } from '../db';
import { AppError } from '../errors/AppError';
import {
  parseNewVehicle,
  parsePurchaseQuantity,
  parseRestockQuantity,
  parseSearchQuery,
  parseVehicleId,
  parseVehicleUpdate,
  VehicleSearchFilters,
} from '../validation/vehicleValidation';
import { findVehicleImage } from './imageService';

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
  const input = parseNewVehicle(body);
  // Use the supplied image, otherwise try to find one. A failed lookup just leaves it empty.
  const imageUrl = input.imageUrl ?? (await findVehicleImage(input.make, input.model));
  return prisma.vehicle.create({ data: { ...input, imageUrl } });
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
  const existing = await getVehicleOrThrow(id);
  // imageUrl === null means the caller cleared it: search again for the (possibly renamed) car.
  if (data.imageUrl === null) {
    data.imageUrl = await findVehicleImage(data.make ?? existing.make, data.model ?? existing.model);
  }
  return prisma.vehicle.update({ where: { id }, data });
}

export async function deleteVehicle(rawId: unknown): Promise<void> {
  const id = parseVehicleId(rawId);
  await getVehicleOrThrow(id);
  await prisma.vehicle.delete({ where: { id } });
}

/**
 * Buys `quantity` vehicles (default 1).
 * The stock check and the subtraction happen in ONE database statement, so two
 * buyers can never both take the last car.
 */
export async function purchaseVehicle(rawId: unknown, body: unknown): Promise<Vehicle> {
  const id = parseVehicleId(rawId);
  const quantity = parsePurchaseQuantity(body);

  const result = await prisma.vehicle.updateMany({
    where: { id, quantity: { gte: quantity } },
    data: { quantity: { decrement: quantity } },
  });

  if (result.count === 0) {
    await getVehicleOrThrow(id); // throws 404 if the vehicle does not exist at all
    throw new AppError(409, 'Not enough vehicles in stock');
  }
  return getVehicleOrThrow(id);
}

/** Adds `quantity` vehicles to the stock. The increment is done by the database itself. */
export async function restockVehicle(rawId: unknown, body: unknown): Promise<Vehicle> {
  const id = parseVehicleId(rawId);
  const quantity = parseRestockQuantity(body);
  await getVehicleOrThrow(id);
  return prisma.vehicle.update({ where: { id }, data: { quantity: { increment: quantity } } });
}
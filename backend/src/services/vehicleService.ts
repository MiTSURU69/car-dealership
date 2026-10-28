import { Prisma, Vehicle } from '@prisma/client';
import { prisma } from '../db';
import { AppError } from '../errors/AppError';
import {
  ListOptions,
  parseListOptions,
  parseNewVehicle,
  parsePurchaseQuantity,
  parseRestockQuantity,
  parseSearchQuery,
  parseVehicleId,
  parseVehicleUpdate,
  SortOption,
  VehicleSearchFilters,
} from '../validation/vehicleValidation';
import { findVehicleImage } from './imageService';

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface VehiclePage {
  vehicles: Vehicle[];
  pagination: Pagination;
}

/** Maps a sort option to a Prisma ordering. No option keeps the original id order. */
const ORDERINGS: Record<SortOption | 'default', Prisma.VehicleOrderByWithRelationInput[]> = {
  default: [{ id: 'asc' }],
  newest: [{ createdAt: 'desc' }, { id: 'desc' }],
  oldest: [{ createdAt: 'asc' }, { id: 'asc' }],
  price_asc: [{ price: 'asc' }, { id: 'asc' }],
  price_desc: [{ price: 'desc' }, { id: 'asc' }],
  name: [{ make: 'asc' }, { model: 'asc' }, { id: 'asc' }],
};

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
  
  if (filters.quantity !== undefined) {
    where.quantity = filters.quantity;
  }
  return where;
}
  

/** Runs one filtered, sorted, paginated query and reports the totals. */
async function findPage(where: Prisma.VehicleWhereInput, options: ListOptions): Promise<VehiclePage> {
  const { sort, page, limit } = options;
  const [total, vehicles] = await prisma.$transaction([
    prisma.vehicle.count({ where }),
    prisma.vehicle.findMany({
      where,
      orderBy: ORDERINGS[sort ?? 'default'],
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);
  return { vehicles, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
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

export async function listVehicles(query: unknown): Promise<VehiclePage> {
  return findPage({}, parseListOptions(query));
}

export async function searchVehicles(query: unknown): Promise<VehiclePage> {
  return findPage(buildSearchFilter(parseSearchQuery(query)), parseListOptions(query));
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
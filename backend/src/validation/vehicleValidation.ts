import { AppError } from '../errors/AppError';

export interface VehicleInput {
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
  /** Optional photo URL. When missing, the service looks one up. */
  imageUrl?: string;
}

/** An update can also send imageUrl: null, which means "find one automatically". */
export type VehicleUpdate = Partial<Omit<VehicleInput, 'imageUrl'>> & { imageUrl?: string | null };

function requiredText(value: unknown, field: string): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new AppError(400, `${field} is required`);
  }
  return value.trim();
}

function validPrice(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    throw new AppError(400, 'price must be a number that is 0 or more');
  }
  return value;
}

function validQuantity(value: unknown): number {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) {
    throw new AppError(400, 'quantity must be a whole number that is 0 or more');
  }
  return value;
}

/** Accepts only http(s) URLs, so values like "javascript:..." can never reach an <img> tag. */
function validImageUrl(value: unknown): string {
  if (typeof value !== 'string') throw new AppError(400, 'imageUrl must be a text URL');
  try {
    const url = new URL(value.trim());
    if (url.protocol === 'http:' || url.protocol === 'https:') return url.toString();
  } catch {
    // fall through to the error below
  }
  throw new AppError(400, 'imageUrl must be a valid http(s) URL');
}

/** Empty or missing means "not provided". */
function optionalImageUrl(value: unknown): string | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  return validImageUrl(value);
}

/** Validates the body of a "create vehicle" request. */
export function parseNewVehicle(body: any): VehicleInput {
  return {
    make: requiredText(body?.make, 'make'),
    model: requiredText(body?.model, 'model'),
    category: requiredText(body?.category, 'category'),
    price: validPrice(body?.price),
    quantity: body?.quantity === undefined ? 0 : validQuantity(body.quantity),
    imageUrl: optionalImageUrl(body?.imageUrl),
  };
}

export interface VehicleSearchFilters {
  make?: string;
  model?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}

function optionalText(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function optionalPrice(value: unknown, field: string): number | undefined {
  if (value === undefined || value === '') return undefined;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new AppError(400, `${field} must be a number that is 0 or more`);
  }
  return parsed;
}

/** Validates the query string of a search request. Every filter is optional. */
export function parseSearchQuery(query: any): VehicleSearchFilters {
  const filters: VehicleSearchFilters = {
    make: optionalText(query?.make),
    model: optionalText(query?.model),
    category: optionalText(query?.category),
    minPrice: optionalPrice(query?.minPrice, 'minPrice'),
    maxPrice: optionalPrice(query?.maxPrice, 'maxPrice'),
  };

  const { minPrice, maxPrice } = filters;
  if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
    throw new AppError(400, 'minPrice cannot be greater than maxPrice');
  }
  return filters;
}

/** Validates a vehicle id from the URL. */
export function parseVehicleId(raw: unknown): number {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) throw new AppError(400, 'Invalid vehicle id');
  return id;
}

/** Validates a partial update: only the fields that were sent are checked and kept. */
export function parseVehicleUpdate(body: any): VehicleUpdate {
  const update: VehicleUpdate = {};
  if (body?.make !== undefined) update.make = requiredText(body.make, 'make');
  if (body?.model !== undefined) update.model = requiredText(body.model, 'model');
  if (body?.category !== undefined) update.category = requiredText(body.category, 'category');
  if (body?.price !== undefined) update.price = validPrice(body.price);
  if (body?.quantity !== undefined) update.quantity = validQuantity(body.quantity);
  if (body?.imageUrl !== undefined) {
    // An empty value means "search for one again", stored as null until the service fills it in.
    update.imageUrl = optionalImageUrl(body.imageUrl) ?? null;
  }
  
  if (Object.keys(update).length === 0) {
    throw new AppError(400, 'Provide at least one field to update');
  }
  return update;
}

function positiveWholeNumber(value: unknown): number {
  if (typeof value !== 'number' || !Number.isInteger(value) || value <= 0) {
    throw new AppError(400, 'quantity must be a whole number greater than 0');
  }
  return value;
}

/** How many vehicles to buy. Optional, defaults to 1. */
export function parsePurchaseQuantity(body: any): number {
  if (body?.quantity === undefined) return 1;
  return positiveWholeNumber(body.quantity);
}

/** How many vehicles to add to stock. Required. */
export function parseRestockQuantity(body: any): number {
  if (body?.quantity === undefined) throw new AppError(400, 'quantity is required');
  return positiveWholeNumber(body.quantity);
}
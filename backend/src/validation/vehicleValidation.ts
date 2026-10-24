import { AppError } from '../errors/AppError';

export interface VehicleInput {
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
}

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

/** Validates the body of a "create vehicle" request. */
export function parseNewVehicle(body: any): VehicleInput {
  return {
    make: requiredText(body?.make, 'make'),
    model: requiredText(body?.model, 'model'),
    category: requiredText(body?.category, 'category'),
    price: validPrice(body?.price),
    quantity: body?.quantity === undefined ? 0 : validQuantity(body.quantity),
  };
}
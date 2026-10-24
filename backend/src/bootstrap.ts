import bcrypt from 'bcryptjs';
import { prisma } from './db';
import { findVehicleImage } from './services/imageService';

const SALT_ROUNDS = 10;

/** Cars shown on a fresh deployment. Names are ones Wikipedia has pages for, so photos can be found. */
export const DEMO_VEHICLES = [
  { make: 'Toyota', model: 'Corolla', category: 'Sedan', price: 21000, quantity: 8 },
  { make: 'Honda', model: 'Civic', category: 'Sedan', price: 23500, quantity: 6 },
  { make: 'Tesla', model: 'Model 3', category: 'Sedan', price: 38990, quantity: 4 },
  { make: 'BMW', model: '3 Series', category: 'Sedan', price: 44000, quantity: 3 },
  { make: 'Toyota', model: 'RAV4', category: 'SUV', price: 29500, quantity: 7 },
  { make: 'Ford', model: 'Explorer', category: 'SUV', price: 38000, quantity: 5 },
  { make: 'Jeep', model: 'Wrangler', category: 'SUV', price: 33000, quantity: 2 },
  { make: 'Ford', model: 'Mustang', category: 'Coupe', price: 32000, quantity: 3 },
  { make: 'Chevrolet', model: 'Camaro', category: 'Coupe', price: 30500, quantity: 0 }, // sold out on purpose
  { make: 'Porsche', model: '911', category: 'Coupe', price: 115000, quantity: 1 },
  { make: 'Ford', model: 'F-150', category: 'Truck', price: 36000, quantity: 6 },
  { make: 'Tesla', model: 'Cybertruck', category: 'Truck', price: 79990, quantity: 2 },
];

/** Creates the admin account, or promotes and resets the password of an existing one. */
export async function ensureAdmin(email: string, password: string): Promise<void> {
  const normalized = email.trim().toLowerCase();
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  await prisma.user.upsert({
    where: { email: normalized },
    update: { role: 'admin', passwordHash },
    create: { name: 'Admin', email: normalized, passwordHash, role: 'admin' },
  });
}

/** Adds the demo cars, but only into an empty table. Returns how many were added. */
export async function seedDemoVehicles(): Promise<number> {
  if ((await prisma.vehicle.count()) > 0) return 0;
  const result = await prisma.vehicle.createMany({ data: DEMO_VEHICLES });
  return result.count;
}

/** Looks up photos for vehicles that have none. Slow, so the server runs it after it starts listening. */
export async function fillMissingImages(): Promise<void> {
  const vehicles = await prisma.vehicle.findMany({ where: { imageUrl: null } });
  for (const vehicle of vehicles) {
    const imageUrl = await findVehicleImage(vehicle.make, vehicle.model);
    if (imageUrl) {
      await prisma.vehicle.update({ where: { id: vehicle.id }, data: { imageUrl } });
    }
  }
}
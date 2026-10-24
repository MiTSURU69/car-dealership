import bcrypt from 'bcryptjs';
import { prisma } from '../src/db';
import { DEMO_VEHICLES, ensureAdmin, fillMissingImages, seedDemoVehicles } from '../src/bootstrap';

const mockFetch = fetch as jest.Mock;

afterAll(async () => {
  await prisma.$disconnect();
});

describe('ensureAdmin', () => {
  beforeEach(async () => {
    await prisma.user.deleteMany();
  });

  it('creates an admin whose password is stored hashed', async () => {
    await ensureAdmin('Boss@Example.com', 'ProdPassword123');

    const admin = await prisma.user.findUnique({ where: { email: 'boss@example.com' } });
    expect(admin!.role).toBe('admin');
    expect(await bcrypt.compare('ProdPassword123', admin!.passwordHash)).toBe(true);
  });

  it('promotes an existing account instead of creating a duplicate', async () => {
    await prisma.user.create({
      data: { name: 'Asha', email: 'boss@example.com', passwordHash: 'x', role: 'user' },
    });

    await ensureAdmin('boss@example.com', 'ProdPassword123');

    const users = await prisma.user.findMany();
    expect(users).toHaveLength(1);
    expect(users[0].role).toBe('admin');
  });
});

describe('seedDemoVehicles', () => {
  beforeEach(async () => {
    await prisma.vehicle.deleteMany();
  });

  it('adds the demo cars to an empty table', async () => {
    const added = await seedDemoVehicles();

    expect(added).toBe(DEMO_VEHICLES.length);
    expect(await prisma.vehicle.count()).toBe(DEMO_VEHICLES.length);
  });

  it('does nothing when vehicles already exist', async () => {
    await prisma.vehicle.create({
      data: { make: 'Mine', model: 'Own', category: 'Sedan', price: 1, quantity: 1 },
    });

    expect(await seedDemoVehicles()).toBe(0);
    expect(await prisma.vehicle.count()).toBe(1);
  });
});

describe('fillMissingImages', () => {
  beforeEach(async () => {
    await prisma.vehicle.deleteMany();
  });

  it('stores a found photo on vehicles that have none', async () => {
    const car = await prisma.vehicle.create({
      data: { make: 'Toyota', model: 'Corolla', category: 'Sedan', price: 1, quantity: 1 },
    });
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ type: 'standard', thumbnail: { source: 'https://upload.wikimedia.org/c.jpg' } }),
    });

    await fillMissingImages();

    const stored = await prisma.vehicle.findUnique({ where: { id: car.id } });
    expect(stored!.imageUrl).toBe('https://upload.wikimedia.org/c.jpg');
  });
});
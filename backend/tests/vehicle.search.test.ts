import request from 'supertest';
import { app } from '../src/app';
import { prisma } from '../src/db';
import { createTokenFor } from './helpers/auth';

describe('GET /api/vehicles/search', () => {
  let userToken: string;

  beforeEach(async () => {
    await prisma.vehicle.deleteMany();
    await prisma.user.deleteMany();
    userToken = await createTokenFor('user');
    await prisma.vehicle.createMany({
      data: [
        { make: 'Toyota', model: 'Corolla', category: 'Sedan', price: 20000, quantity: 5 },
        { make: 'Toyota', model: 'RAV4', category: 'SUV', price: 30000, quantity: 3 },
        { make: 'Honda', model: 'Civic', category: 'Sedan', price: 22000, quantity: 0 },
        { make: 'BMW', model: 'X5', category: 'SUV', price: 60000, quantity: 2 },
      ],
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  const search = (query: string) =>
    request(app).get(`/api/vehicles/search${query}`).set('Authorization', `Bearer ${userToken}`);

  it('rejects a request without a token', async () => {
    const res = await request(app).get('/api/vehicles/search?make=toyota');
    expect(res.status).toBe(401);
  });

  it('filters by make, ignoring case', async () => {
    const res = await search('?make=toyota');
    expect(res.status).toBe(200);
    expect(res.body.vehicles).toHaveLength(2);
  });

  it('filters by model', async () => {
    const res = await search('?model=civic');
    expect(res.body.vehicles).toHaveLength(1);
    expect(res.body.vehicles[0].make).toBe('Honda');
  });

  it('filters by category', async () => {
    const res = await search('?category=suv');
    expect(res.body.vehicles).toHaveLength(2);
  });

  it('filters by price range (inclusive)', async () => {
    const res = await search('?minPrice=22000&maxPrice=30000');
    const models = res.body.vehicles.map((v: { model: string }) => v.model).sort();
    expect(models).toEqual(['Civic', 'RAV4']);
  });

  it('combines several filters', async () => {
    const res = await search('?make=toyota&category=suv');
    expect(res.body.vehicles).toHaveLength(1);
    expect(res.body.vehicles[0].model).toBe('RAV4');
  });

  it('rejects a non-numeric price with 400', async () => {
    const res = await search('?minPrice=abc');
    expect(res.status).toBe(400);
  });

  it('rejects minPrice greater than maxPrice with 400', async () => {
    const res = await search('?minPrice=50000&maxPrice=1000');
    expect(res.status).toBe(400);
  });

it('filters by exact quantity', async () => {
  const res = await search('?quantity=2');
  expect(res.status).toBe(200);
  expect(res.body.vehicles).toHaveLength(1);
  expect(res.body.vehicles[0].model).toBe('X5');
});

it('rejects invalid quantity with 400', async () => {
  const res = await search('?quantity=-1');
  expect(res.status).toBe(400);
});
});
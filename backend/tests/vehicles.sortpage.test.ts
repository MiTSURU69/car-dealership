import request from 'supertest';
import { app } from '../src/app';
import { prisma } from '../src/db';
import { createTokenFor } from './helpers/auth';

describe('sorting and pagination', () => {
  let token: string;

  beforeEach(async () => {
    await prisma.vehicle.deleteMany();
    await prisma.user.deleteMany();
    token = await createTokenFor('user');
    // Created one by one so createdAt strictly increases: Alpha, Bravo, Charlie, Delta, Echo
    const cars = [
      { make: 'Toyota', model: 'Alpha', price: 30000 },
      { make: 'Honda', model: 'Bravo', price: 10000 },
      { make: 'Ford', model: 'Charlie', price: 50000 },
      { make: 'BMW', model: 'Delta', price: 20000 },
      { make: 'Audi', model: 'Echo', price: 40000 },
    ];
    for (const car of cars) {
      await prisma.vehicle.create({ data: { ...car, category: 'Sedan', quantity: 1 } });
      await new Promise((resolve) => setTimeout(resolve, 5));
    }
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  const get = (path: string) => request(app).get(path).set('Authorization', `Bearer ${token}`);
  const models = (res: request.Response) => res.body.vehicles.map((v: { model: string }) => v.model);

  it('sorts by price ascending', async () => {
    const res = await get('/api/vehicles?sort=price_asc');
    expect(models(res)).toEqual(['Bravo', 'Delta', 'Alpha', 'Echo', 'Charlie']);
  });

  it('sorts by price descending', async () => {
    const res = await get('/api/vehicles?sort=price_desc');
    expect(models(res)).toEqual(['Charlie', 'Echo', 'Alpha', 'Delta', 'Bravo']);
  });

  it('sorts newest first', async () => {
    const res = await get('/api/vehicles?sort=newest');
    expect(models(res)).toEqual(['Echo', 'Delta', 'Charlie', 'Bravo', 'Alpha']);
  });

  it('sorts oldest first', async () => {
    const res = await get('/api/vehicles?sort=oldest');
    expect(models(res)).toEqual(['Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo']);
  });

  it('sorts by make name', async () => {
    const res = await get('/api/vehicles?sort=name');
    expect(models(res)).toEqual(['Echo', 'Delta', 'Charlie', 'Bravo', 'Alpha']);
  });

  it('keeps the original order when no sort is given', async () => {
    const res = await get('/api/vehicles');
    expect(models(res)).toEqual(['Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo']);
  });

  it('returns the first page with pagination details', async () => {
    const res = await get('/api/vehicles?limit=2');

    expect(res.status).toBe(200);
    expect(models(res)).toEqual(['Alpha', 'Bravo']);
    expect(res.body.pagination).toEqual({ page: 1, limit: 2, total: 5, totalPages: 3 });
  });

  it('returns later pages, including a short last page', async () => {
    expect(models(await get('/api/vehicles?limit=2&page=2'))).toEqual(['Charlie', 'Delta']);
    expect(models(await get('/api/vehicles?limit=2&page=3'))).toEqual(['Echo']);
  });

  it('returns an empty list past the last page', async () => {
    const res = await get('/api/vehicles?limit=2&page=9');
    expect(res.body.vehicles).toEqual([]);
    expect(res.body.pagination.total).toBe(5);
  });

  it('combines search, sort and pagination', async () => {
    const res = await get('/api/vehicles/search?minPrice=20000&sort=price_asc&limit=2&page=1');

    expect(models(res)).toEqual(['Delta', 'Alpha']);
    expect(res.body.pagination.total).toBe(4);
    expect(res.body.pagination.totalPages).toBe(2);
  });

  it('rejects an unknown sort with 400', async () => {
    expect((await get('/api/vehicles?sort=banana')).status).toBe(400);
  });

  it('rejects bad page and limit values with 400', async () => {
    expect((await get('/api/vehicles?page=0')).status).toBe(400);
    expect((await get('/api/vehicles?page=abc')).status).toBe(400);
    expect((await get('/api/vehicles?limit=0')).status).toBe(400);
    expect((await get('/api/vehicles?limit=51')).status).toBe(400);
  });
});
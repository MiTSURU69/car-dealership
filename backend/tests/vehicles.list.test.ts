import request from 'supertest';
import { app } from '../src/app';
import { prisma } from '../src/db';
import { createTokenFor } from './helpers/auth';

describe('GET /api/vehicles', () => {
  let userToken: string;

  beforeEach(async () => {
    await prisma.vehicle.deleteMany();
    await prisma.user.deleteMany();
    userToken = await createTokenFor('user');
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('rejects a request without a token', async () => {
    const res = await request(app).get('/api/vehicles');
    expect(res.status).toBe(401);
  });

  it('returns an empty list when there are no vehicles', async () => {
    const res = await request(app).get('/api/vehicles').set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.vehicles).toEqual([]);
  });

  it('returns every vehicle, including ones that are out of stock', async () => {
    await prisma.vehicle.createMany({
      data: [
        { make: 'Toyota', model: 'Corolla', category: 'Sedan', price: 20000, quantity: 5 },
        { make: 'Honda', model: 'Civic', category: 'Sedan', price: 22000, quantity: 0 },
      ],
    });

    const res = await request(app).get('/api/vehicles').set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.vehicles).toHaveLength(2);
  });
});
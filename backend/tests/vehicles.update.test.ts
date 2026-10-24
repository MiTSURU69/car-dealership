import request from 'supertest';
import { app } from '../src/app';
import { prisma } from '../src/db';
import { createTokenFor } from './helpers/auth';

describe('PUT /api/vehicles/:id', () => {
  let userToken: string;
  let vehicleId: number;

  beforeEach(async () => {
    await prisma.vehicle.deleteMany();
    await prisma.user.deleteMany();
    userToken = await createTokenFor('user');
    const vehicle = await prisma.vehicle.create({
      data: { make: 'Toyota', model: 'Corolla', category: 'Sedan', price: 20000, quantity: 5 },
    });
    vehicleId = vehicle.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  const put = (id: number | string, body: object) =>
    request(app).put(`/api/vehicles/${id}`).set('Authorization', `Bearer ${userToken}`).send(body);

  it('rejects a request without a token', async () => {
    const res = await request(app).put(`/api/vehicles/${vehicleId}`).send({ price: 1 });
    expect(res.status).toBe(401);
  });

  it('updates only the fields that were sent', async () => {
    const res = await put(vehicleId, { price: 25000 });

    expect(res.status).toBe(200);
    expect(res.body.vehicle).toMatchObject({ make: 'Toyota', price: 25000, quantity: 5 });
  });

  it('returns 404 for a vehicle that does not exist', async () => {
    const res = await put(99999, { price: 25000 });
    expect(res.status).toBe(404);
  });

  it('returns 400 for an invalid id', async () => {
    const res = await put('abc', { price: 25000 });
    expect(res.status).toBe(400);
  });

  it('returns 400 for an invalid price', async () => {
    const res = await put(vehicleId, { price: -5 });
    expect(res.status).toBe(400);
  });

  it('returns 400 when there is nothing to update', async () => {
    const res = await put(vehicleId, {});
    expect(res.status).toBe(400);
  });
});
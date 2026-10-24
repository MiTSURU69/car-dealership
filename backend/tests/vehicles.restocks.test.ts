import request from 'supertest';
import { app } from '../src/app';
import { prisma } from '../src/db';
import { createTokenFor } from './helpers/auth';

describe('POST /api/vehicles/:id/restock', () => {
  let userToken: string;
  let adminToken: string;
  let vehicleId: number;

  beforeEach(async () => {
    await prisma.vehicle.deleteMany();
    await prisma.user.deleteMany();
    userToken = await createTokenFor('user');
    adminToken = await createTokenFor('admin');
    const vehicle = await prisma.vehicle.create({
      data: { make: 'Toyota', model: 'Corolla', category: 'Sedan', price: 20000, quantity: 5 },
    });
    vehicleId = vehicle.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  const restock = (id: number | string, body: object, token = adminToken) =>
    request(app)
      .post(`/api/vehicles/${id}/restock`)
      .set('Authorization', `Bearer ${token}`)
      .send(body);

  it('rejects a request without a token', async () => {
    const res = await request(app).post(`/api/vehicles/${vehicleId}/restock`).send({ quantity: 3 });
    expect(res.status).toBe(401);
  });

  it('forbids a regular user with 403 and leaves the stock unchanged', async () => {
    const res = await restock(vehicleId, { quantity: 3 }, userToken);

    expect(res.status).toBe(403);
    const stored = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
    expect(stored!.quantity).toBe(5);
  });

  it('lets an admin add stock', async () => {
    const res = await restock(vehicleId, { quantity: 3 });

    expect(res.status).toBe(200);
    expect(res.body.vehicle.quantity).toBe(8);
  });

  it('returns 404 for a vehicle that does not exist', async () => {
    const res = await restock(99999, { quantity: 3 });
    expect(res.status).toBe(404);
  });

  it('returns 400 for an invalid id', async () => {
    const res = await restock('abc', { quantity: 3 });
    expect(res.status).toBe(400);
  });

  it('returns 400 when quantity is missing', async () => {
    const res = await restock(vehicleId, {});
    expect(res.status).toBe(400);
  });

  it('returns 400 for a quantity of 0 or less', async () => {
    expect((await restock(vehicleId, { quantity: 0 })).status).toBe(400);
    expect((await restock(vehicleId, { quantity: -4 })).status).toBe(400);
  });

  it('returns 400 for a non-integer quantity', async () => {
    const res = await restock(vehicleId, { quantity: 2.5 });
    expect(res.status).toBe(400);
  });
});
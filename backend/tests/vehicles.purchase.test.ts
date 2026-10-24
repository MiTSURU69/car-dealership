import request from 'supertest';
import { app } from '../src/app';
import { prisma } from '../src/db';
import { createTokenFor } from './helpers/auth';

describe('POST /api/vehicles/:id/purchase', () => {
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

  const purchase = (id: number | string, body: object = {}) =>
    request(app)
      .post(`/api/vehicles/${id}/purchase`)
      .set('Authorization', `Bearer ${userToken}`)
      .send(body);

  it('rejects a request without a token', async () => {
    const res = await request(app).post(`/api/vehicles/${vehicleId}/purchase`);
    expect(res.status).toBe(401);
  });

  it('buys one vehicle by default and lowers the stock by 1', async () => {
    const res = await purchase(vehicleId);

    expect(res.status).toBe(200);
    expect(res.body.vehicle.quantity).toBe(4);
  });

  it('buys several vehicles when a quantity is given', async () => {
    const res = await purchase(vehicleId, { quantity: 2 });

    expect(res.status).toBe(200);
    expect(res.body.vehicle.quantity).toBe(3);
  });

  it('rejects the purchase with 409 when the vehicle is out of stock', async () => {
    await prisma.vehicle.update({ where: { id: vehicleId }, data: { quantity: 0 } });

    const res = await purchase(vehicleId);

    expect(res.status).toBe(409);
  });

  it('rejects buying more than is in stock and leaves the stock unchanged', async () => {
    const res = await purchase(vehicleId, { quantity: 6 });

    expect(res.status).toBe(409);
    const stored = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
    expect(stored!.quantity).toBe(5);
  });

  it('returns 404 for a vehicle that does not exist', async () => {
    const res = await purchase(99999);
    expect(res.status).toBe(404);
  });

  it('returns 400 for an invalid id', async () => {
    const res = await purchase('abc');
    expect(res.status).toBe(400);
  });

  it('returns 400 for a quantity of 0 or a non-integer', async () => {
    expect((await purchase(vehicleId, { quantity: 0 })).status).toBe(400);
    expect((await purchase(vehicleId, { quantity: 1.5 })).status).toBe(400);
  });

  it('never oversells when many people buy at the same time', async () => {
    // 8 simultaneous buyers, only 5 cars in stock.
    const results = await Promise.all(Array.from({ length: 8 }, () => purchase(vehicleId)));

    const succeeded = results.filter((r) => r.status === 200).length;
    const rejected = results.filter((r) => r.status === 409).length;
    expect(succeeded).toBe(5);
    expect(rejected).toBe(3);

    const stored = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
    expect(stored!.quantity).toBe(0);
  });
});
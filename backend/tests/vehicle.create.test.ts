import request from 'supertest';
import { app } from '../src/app';
import { prisma } from '../src/db';
import { createTokenFor } from './helpers/auth';

describe('POST /api/vehicles', () => {
  const validVehicle = {
    make: 'Toyota',
    model: 'Corolla',
    category: 'Sedan',
    price: 20000,
    quantity: 5,
  };
  let userToken: string;

  beforeEach(async () => {
    await prisma.vehicle.deleteMany();
    await prisma.user.deleteMany();
    userToken = await createTokenFor('user');
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  const post = (body: object) =>
    request(app).post('/api/vehicles').set('Authorization', `Bearer ${userToken}`).send(body);

  it('rejects a request without a token', async () => {
    const res = await request(app).post('/api/vehicles').send(validVehicle);
    expect(res.status).toBe(401);
  });

  it('creates a vehicle and returns it with an id', async () => {
    const res = await post(validVehicle);

    expect(res.status).toBe(201);
    expect(res.body.vehicle).toMatchObject(validVehicle);
    expect(res.body.vehicle.id).toBeDefined();
  });

  it('defaults quantity to 0 when omitted', async () => {
    const { quantity, ...withoutQuantity } = validVehicle;
    const res = await post(withoutQuantity);

    expect(res.status).toBe(201);
    expect(res.body.vehicle.quantity).toBe(0);
  });

  it('rejects a missing make with 400', async () => {
    const { make, ...withoutMake } = validVehicle;
    const res = await post(withoutMake);
    expect(res.status).toBe(400);
  });

  it('rejects a negative price with 400', async () => {
    const res = await post({ ...validVehicle, price: -1 });
    expect(res.status).toBe(400);
  });

  it('rejects a non-integer quantity with 400', async () => {
    const res = await post({ ...validVehicle, quantity: 2.5 });
    expect(res.status).toBe(400);
  });
});
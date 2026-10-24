import request from 'supertest';
import { app } from '../src/app';
import { prisma } from '../src/db';
import { createTokenFor } from './helpers/auth';

describe('DELETE /api/vehicles/:id', () => {
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

  it('rejects a request without a token', async () => {
    const res = await request(app).delete(`/api/vehicles/${vehicleId}`);
    expect(res.status).toBe(401);
  });

  it('forbids a regular user with 403 and keeps the vehicle', async () => {
    const res = await request(app)
      .delete(`/api/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(403);
    expect(await prisma.vehicle.findUnique({ where: { id: vehicleId } })).not.toBeNull();
  });

  it('lets an admin delete a vehicle (204)', async () => {
    const res = await request(app)
      .delete(`/api/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(204);
    expect(await prisma.vehicle.findUnique({ where: { id: vehicleId } })).toBeNull();
  });

  it('returns 404 when an admin deletes a vehicle that does not exist', async () => {
    const res = await request(app)
      .delete('/api/vehicles/99999')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(404);
  });
});
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = require("../src/app");
const db_1 = require("../src/db");
const auth_1 = require("./helpers/auth");
describe('POST /api/vehicles/:id/restock', () => {
    let userToken;
    let adminToken;
    let vehicleId;
    beforeEach(async () => {
        await db_1.prisma.vehicle.deleteMany();
        await db_1.prisma.user.deleteMany();
        userToken = await (0, auth_1.createTokenFor)('user');
        adminToken = await (0, auth_1.createTokenFor)('admin');
        const vehicle = await db_1.prisma.vehicle.create({
            data: { make: 'Toyota', model: 'Corolla', category: 'Sedan', price: 20000, quantity: 5 },
        });
        vehicleId = vehicle.id;
    });
    afterAll(async () => {
        await db_1.prisma.$disconnect();
    });
    const restock = (id, body, token = adminToken) => (0, supertest_1.default)(app_1.app)
        .post(`/api/vehicles/${id}/restock`)
        .set('Authorization', `Bearer ${token}`)
        .send(body);
    it('rejects a request without a token', async () => {
        const res = await (0, supertest_1.default)(app_1.app).post(`/api/vehicles/${vehicleId}/restock`).send({ quantity: 3 });
        expect(res.status).toBe(401);
    });
    it('forbids a regular user with 403 and leaves the stock unchanged', async () => {
        const res = await restock(vehicleId, { quantity: 3 }, userToken);
        expect(res.status).toBe(403);
        const stored = await db_1.prisma.vehicle.findUnique({ where: { id: vehicleId } });
        expect(stored.quantity).toBe(5);
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

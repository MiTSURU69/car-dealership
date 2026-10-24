"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = require("../src/app");
const db_1 = require("../src/db");
const auth_1 = require("./helpers/auth");
describe('PUT /api/vehicles/:id', () => {
    let userToken;
    let vehicleId;
    beforeEach(async () => {
        await db_1.prisma.vehicle.deleteMany();
        await db_1.prisma.user.deleteMany();
        userToken = await (0, auth_1.createTokenFor)('user');
        const vehicle = await db_1.prisma.vehicle.create({
            data: { make: 'Toyota', model: 'Corolla', category: 'Sedan', price: 20000, quantity: 5 },
        });
        vehicleId = vehicle.id;
    });
    afterAll(async () => {
        await db_1.prisma.$disconnect();
    });
    const put = (id, body) => (0, supertest_1.default)(app_1.app).put(`/api/vehicles/${id}`).set('Authorization', `Bearer ${userToken}`).send(body);
    it('rejects a request without a token', async () => {
        const res = await (0, supertest_1.default)(app_1.app).put(`/api/vehicles/${vehicleId}`).send({ price: 1 });
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

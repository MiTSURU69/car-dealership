"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = require("../src/app");
const db_1 = require("../src/db");
const auth_1 = require("./helpers/auth");
describe('DELETE /api/vehicles/:id', () => {
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
    it('rejects a request without a token', async () => {
        const res = await (0, supertest_1.default)(app_1.app).delete(`/api/vehicles/${vehicleId}`);
        expect(res.status).toBe(401);
    });
    it('forbids a regular user with 403 and keeps the vehicle', async () => {
        const res = await (0, supertest_1.default)(app_1.app)
            .delete(`/api/vehicles/${vehicleId}`)
            .set('Authorization', `Bearer ${userToken}`);
        expect(res.status).toBe(403);
        expect(await db_1.prisma.vehicle.findUnique({ where: { id: vehicleId } })).not.toBeNull();
    });
    it('lets an admin delete a vehicle (204)', async () => {
        const res = await (0, supertest_1.default)(app_1.app)
            .delete(`/api/vehicles/${vehicleId}`)
            .set('Authorization', `Bearer ${adminToken}`);
        expect(res.status).toBe(204);
        expect(await db_1.prisma.vehicle.findUnique({ where: { id: vehicleId } })).toBeNull();
    });
    it('returns 404 when an admin deletes a vehicle that does not exist', async () => {
        const res = await (0, supertest_1.default)(app_1.app)
            .delete('/api/vehicles/99999')
            .set('Authorization', `Bearer ${adminToken}`);
        expect(res.status).toBe(404);
    });
});

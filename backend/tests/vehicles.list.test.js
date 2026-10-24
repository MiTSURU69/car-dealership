"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = require("../src/app");
const db_1 = require("../src/db");
const auth_1 = require("./helpers/auth");
describe('GET /api/vehicles', () => {
    let userToken;
    beforeEach(async () => {
        await db_1.prisma.vehicle.deleteMany();
        await db_1.prisma.user.deleteMany();
        userToken = await (0, auth_1.createTokenFor)('user');
    });
    afterAll(async () => {
        await db_1.prisma.$disconnect();
    });
    it('rejects a request without a token', async () => {
        const res = await (0, supertest_1.default)(app_1.app).get('/api/vehicles');
        expect(res.status).toBe(401);
    });
    it('returns an empty list when there are no vehicles', async () => {
        const res = await (0, supertest_1.default)(app_1.app).get('/api/vehicles').set('Authorization', `Bearer ${userToken}`);
        expect(res.status).toBe(200);
        expect(res.body.vehicles).toEqual([]);
    });
    it('returns every vehicle, including ones that are out of stock', async () => {
        await db_1.prisma.vehicle.createMany({
            data: [
                { make: 'Toyota', model: 'Corolla', category: 'Sedan', price: 20000, quantity: 5 },
                { make: 'Honda', model: 'Civic', category: 'Sedan', price: 22000, quantity: 0 },
            ],
        });
        const res = await (0, supertest_1.default)(app_1.app).get('/api/vehicles').set('Authorization', `Bearer ${userToken}`);
        expect(res.status).toBe(200);
        expect(res.body.vehicles).toHaveLength(2);
    });
});

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = require("../src/app");
const db_1 = require("../src/db");
const auth_1 = require("./helpers/auth");
describe('POST /api/vehicles', () => {
    const validVehicle = {
        make: 'Toyota',
        model: 'Corolla',
        category: 'Sedan',
        price: 20000,
        quantity: 5,
    };
    let userToken;
    beforeEach(async () => {
        await db_1.prisma.vehicle.deleteMany();
        await db_1.prisma.user.deleteMany();
        userToken = await (0, auth_1.createTokenFor)('user');
    });
    afterAll(async () => {
        await db_1.prisma.$disconnect();
    });
    const post = (body) => (0, supertest_1.default)(app_1.app).post('/api/vehicles').set('Authorization', `Bearer ${userToken}`).send(body);
    it('rejects a request without a token', async () => {
        const res = await (0, supertest_1.default)(app_1.app).post('/api/vehicles').send(validVehicle);
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

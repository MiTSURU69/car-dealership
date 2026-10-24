"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const app_1 = require("../src/app");
const db_1 = require("../src/db");
describe('POST /api/auth/login', () => {
    const credentials = { email: 'asha@example.com', password: 'Password123' };
    beforeEach(async () => {
        await db_1.prisma.user.deleteMany();
        await (0, supertest_1.default)(app_1.app).post('/api/auth/register').send({ name: 'Asha', ...credentials });
    });
    afterAll(async () => {
        await db_1.prisma.$disconnect();
    });
    it('returns a token and the public user for valid credentials', async () => {
        const res = await (0, supertest_1.default)(app_1.app).post('/api/auth/login').send(credentials);
        expect(res.status).toBe(200);
        expect(typeof res.body.token).toBe('string');
        expect(res.body.user).toMatchObject({ email: 'asha@example.com', role: 'user' });
        expect(res.body.user.passwordHash).toBeUndefined();
    });
    it('puts the user id and role inside the token', async () => {
        const res = await (0, supertest_1.default)(app_1.app).post('/api/auth/login').send(credentials);
        const decoded = jsonwebtoken_1.default.verify(res.body.token, 'test-secret');
        expect(decoded.userId).toBe(res.body.user.id);
        expect(decoded.role).toBe('user');
    });
    it('rejects a wrong password with 401', async () => {
        const res = await (0, supertest_1.default)(app_1.app)
            .post('/api/auth/login')
            .send({ ...credentials, password: 'WrongPassword1' });
        expect(res.status).toBe(401);
    });
    it('rejects an unknown email with 401', async () => {
        const res = await (0, supertest_1.default)(app_1.app)
            .post('/api/auth/login')
            .send({ email: 'nobody@example.com', password: 'Password123' });
        expect(res.status).toBe(401);
    });
    it('rejects missing fields with 400', async () => {
        const res = await (0, supertest_1.default)(app_1.app).post('/api/auth/login').send({ email: credentials.email });
        expect(res.status).toBe(400);
    });
});

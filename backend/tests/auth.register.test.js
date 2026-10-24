"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = require("../src/app");
const db_1 = require("../src/db");
describe('POST /api/auth/register', () => {
    const validUser = {
        name: 'Asha',
        email: 'asha@example.com',
        password: 'Password123',
    };
    beforeEach(async () => {
        await db_1.prisma.user.deleteMany();
    });
    afterAll(async () => {
        await db_1.prisma.$disconnect();
    });
    it('creates a user and does not expose the password', async () => {
        const res = await (0, supertest_1.default)(app_1.app).post('/api/auth/register').send(validUser);
        expect(res.status).toBe(201);
        expect(res.body.user).toMatchObject({
            name: 'Asha',
            email: 'asha@example.com',
            role: 'user',
        });
        expect(res.body.user.id).toBeDefined();
        expect(res.body.user.password).toBeUndefined();
        expect(res.body.user.passwordHash).toBeUndefined();
    });
    it('stores a hashed password, not the plain text', async () => {
        await (0, supertest_1.default)(app_1.app).post('/api/auth/register').send(validUser);
        const stored = await db_1.prisma.user.findUnique({ where: { email: validUser.email } });
        expect(stored).not.toBeNull();
        expect(stored.passwordHash).not.toBe(validUser.password);
    });
    it('rejects a duplicate email with 409', async () => {
        await (0, supertest_1.default)(app_1.app).post('/api/auth/register').send(validUser);
        const res = await (0, supertest_1.default)(app_1.app).post('/api/auth/register').send(validUser);
        expect(res.status).toBe(409);
    });
    it('rejects an invalid email with 400', async () => {
        const res = await (0, supertest_1.default)(app_1.app)
            .post('/api/auth/register')
            .send({ ...validUser, email: 'not-an-email' });
        expect(res.status).toBe(400);
    });
    it('rejects a password shorter than 8 characters with 400', async () => {
        const res = await (0, supertest_1.default)(app_1.app)
            .post('/api/auth/register')
            .send({ ...validUser, password: 'short' });
        expect(res.status).toBe(400);
    });
    it('rejects a missing name with 400', async () => {
        const res = await (0, supertest_1.default)(app_1.app)
            .post('/api/auth/register')
            .send({ email: validUser.email, password: validUser.password });
        expect(res.status).toBe(400);
    });
});

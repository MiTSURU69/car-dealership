"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const app_1 = require("../src/app");
const db_1 = require("../src/db");
const authMiddleware_1 = require("../src/middleware/authMiddleware");
const AppError_1 = require("../src/errors/AppError");
describe('authenticate (via GET /api/auth/me)', () => {
    const credentials = { email: 'asha@example.com', password: 'Password123' };
    beforeEach(async () => {
        await db_1.prisma.user.deleteMany();
        await (0, supertest_1.default)(app_1.app).post('/api/auth/register').send({ name: 'Asha', ...credentials });
    });
    afterAll(async () => {
        await db_1.prisma.$disconnect();
    });
    it('rejects a request with no token', async () => {
        const res = await (0, supertest_1.default)(app_1.app).get('/api/auth/me');
        expect(res.status).toBe(401);
    });
    it('rejects a garbage token', async () => {
        const res = await (0, supertest_1.default)(app_1.app).get('/api/auth/me').set('Authorization', 'Bearer not-a-real-token');
        expect(res.status).toBe(401);
    });
    it('rejects an expired token', async () => {
        const expired = jsonwebtoken_1.default.sign({ userId: 1, role: 'user' }, 'test-secret', { expiresIn: -10 });
        const res = await (0, supertest_1.default)(app_1.app).get('/api/auth/me').set('Authorization', `Bearer ${expired}`);
        expect(res.status).toBe(401);
    });
    it('returns the current user for a valid token', async () => {
        const login = await (0, supertest_1.default)(app_1.app).post('/api/auth/login').send(credentials);
        const res = await (0, supertest_1.default)(app_1.app)
            .get('/api/auth/me')
            .set('Authorization', `Bearer ${login.body.token}`);
        expect(res.status).toBe(200);
        expect(res.body.user.email).toBe('asha@example.com');
    });
});
describe('requireAdmin', () => {
    /** Runs the middleware with a fake response and returns whatever it passed to next(). */
    function run(user) {
        const res = { locals: { user } };
        const next = jest.fn();
        (0, authMiddleware_1.requireAdmin)({}, res, next);
        return next.mock.calls[0][0];
    }
    it('lets an admin through', () => {
        expect(run({ userId: 1, role: 'admin' })).toBeUndefined();
    });
    it('blocks a regular user with 403', () => {
        const error = run({ userId: 2, role: 'user' });
        expect(error).toBeInstanceOf(AppError_1.AppError);
        expect(error.statusCode).toBe(403);
    });
    it('blocks a request with no user with 403', () => {
        expect(run(undefined).statusCode).toBe(403);
    });
});

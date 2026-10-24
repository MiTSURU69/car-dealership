"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTokenFor = createTokenFor;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const supertest_1 = __importDefault(require("supertest"));
const app_1 = require("../../src/app");
const db_1 = require("../../src/db");
/** Creates a user with the given role directly in the DB, logs in, and returns the JWT. */
async function createTokenFor(role) {
    const email = `${role}@example.com`;
    const password = 'Password123';
    const passwordHash = await bcryptjs_1.default.hash(password, 4); // low cost: keeps tests fast
    await db_1.prisma.user.create({ data: { name: role, email, passwordHash, role } });
    const res = await (0, supertest_1.default)(app_1.app).post('/api/auth/login').send({ email, password });
    return res.body.token;
}

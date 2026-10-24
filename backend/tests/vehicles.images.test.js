"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = require("../src/app");
const db_1 = require("../src/db");
const auth_1 = require("./helpers/auth");
const mockFetch = fetch;
describe('vehicle images', () => {
    const vehicle = { make: 'Toyota', model: 'Corolla', category: 'Sedan', price: 20000, quantity: 5 };
    const wikiImage = 'https://upload.wikimedia.org/corolla.jpg';
    let token;
    beforeEach(async () => {
        jest.clearAllMocks();
        await db_1.prisma.vehicle.deleteMany();
        await db_1.prisma.user.deleteMany();
        token = await (0, auth_1.createTokenFor)('user');
    });
    afterAll(async () => {
        await db_1.prisma.$disconnect();
    });
    const found = () => mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ type: 'standard', thumbnail: { source: wikiImage } }),
    });
    const create = (body) => (0, supertest_1.default)(app_1.app).post('/api/vehicles').set('Authorization', `Bearer ${token}`).send(body);
    it('fills in the image automatically when none is given', async () => {
        found();
        const res = await create(vehicle);
        expect(res.status).toBe(201);
        expect(res.body.vehicle.imageUrl).toBe(wikiImage);
    });
    it('uses a supplied image URL and skips the lookup', async () => {
        const res = await create({ ...vehicle, imageUrl: 'https://example.com/my-car.jpg' });
        expect(res.body.vehicle.imageUrl).toBe('https://example.com/my-car.jpg');
        expect(mockFetch).not.toHaveBeenCalled();
    });
    it('still creates the vehicle when the lookup fails', async () => {
        const res = await create(vehicle); // fetch fails by default in tests
        expect(res.status).toBe(201);
        expect(res.body.vehicle.imageUrl).toBeNull();
    });
    it('rejects an image URL that is not http(s) with 400', async () => {
        const res = await create({ ...vehicle, imageUrl: 'javascript:alert(1)' });
        expect(res.status).toBe(400);
    });
    it('searches again on update when the image URL is cleared', async () => {
        const created = await db_1.prisma.vehicle.create({ data: { ...vehicle, imageUrl: 'https://old.example/x.jpg' } });
        found();
        const res = await (0, supertest_1.default)(app_1.app)
            .put(`/api/vehicles/${created.id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ imageUrl: '' });
        expect(res.status).toBe(200);
        expect(res.body.vehicle.imageUrl).toBe(wikiImage);
    });
    it('replaces the image on update when a new URL is given', async () => {
        const created = await db_1.prisma.vehicle.create({ data: vehicle });
        const res = await (0, supertest_1.default)(app_1.app)
            .put(`/api/vehicles/${created.id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ imageUrl: 'https://example.com/new.jpg' });
        expect(res.body.vehicle.imageUrl).toBe('https://example.com/new.jpg');
    });
});

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const imageService_1 = require("../src/services/imageService");
const mockFetch = fetch;
describe('findVehicleImage', () => {
    it('returns the thumbnail URL from the Wikipedia summary', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                type: 'standard',
                thumbnail: { source: 'https://upload.wikimedia.org/corolla.jpg' },
            }),
        });
        expect(await (0, imageService_1.findVehicleImage)('Toyota', 'Corolla')).toBe('https://upload.wikimedia.org/corolla.jpg');
    });
    it('asks for the page named "Make_Model"', async () => {
        mockFetch.mockResolvedValueOnce({ ok: false, json: async () => ({}) });
        await (0, imageService_1.findVehicleImage)('Land Rover', 'Defender');
        expect(mockFetch.mock.calls.at(-1)[0]).toContain('/Land_Rover_Defender');
    });
    it('returns null when the page does not exist', async () => {
        mockFetch.mockResolvedValueOnce({ ok: false, json: async () => ({}) });
        expect(await (0, imageService_1.findVehicleImage)('Nobody', 'Nothing')).toBeNull();
    });
    it('returns null for a disambiguation page', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ type: 'disambiguation', thumbnail: { source: 'https://x/y.jpg' } }),
        });
        expect(await (0, imageService_1.findVehicleImage)('Mustang', 'GT')).toBeNull();
    });
    it('returns null when the page has no image', async () => {
        mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ type: 'standard' }) });
        expect(await (0, imageService_1.findVehicleImage)('Toyota', 'Corolla')).toBeNull();
    });
    it('returns null instead of throwing when the network fails', async () => {
        mockFetch.mockRejectedValueOnce(new Error('offline'));
        expect(await (0, imageService_1.findVehicleImage)('Toyota', 'Corolla')).toBeNull();
    });
});

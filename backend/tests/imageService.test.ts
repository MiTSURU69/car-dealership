import { findVehicleImage } from '../src/services/imageService';

const mockFetch = fetch as jest.Mock;

describe('findVehicleImage', () => {
  it('returns the thumbnail URL from the Wikipedia summary', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        type: 'standard',
        thumbnail: { source: 'https://upload.wikimedia.org/corolla.jpg' },
      }),
    });

    expect(await findVehicleImage('Toyota', 'Corolla')).toBe('https://upload.wikimedia.org/corolla.jpg');
  });

  it('asks for the page named "Make_Model"', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, json: async () => ({}) });

    await findVehicleImage('Land Rover', 'Defender');

    expect(mockFetch.mock.calls.at(-1)![0]).toContain('/Land_Rover_Defender');
  });

  it('returns null when the page does not exist', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, json: async () => ({}) });
    expect(await findVehicleImage('Nobody', 'Nothing')).toBeNull();
  });

  it('returns null for a disambiguation page', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ type: 'disambiguation', thumbnail: { source: 'https://x/y.jpg' } }),
    });
    expect(await findVehicleImage('Mustang', 'GT')).toBeNull();
  });

  it('returns null when the page has no image', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ type: 'standard' }) });
    expect(await findVehicleImage('Toyota', 'Corolla')).toBeNull();
  });

  it('returns null instead of throwing when the network fails', async () => {
    mockFetch.mockRejectedValueOnce(new Error('offline'));
    expect(await findVehicleImage('Toyota', 'Corolla')).toBeNull();
  });
});
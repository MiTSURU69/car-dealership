import request from 'supertest';
import { app } from '../src/app';

describe('CORS', () => {
  it('allows the configured frontend origin', async () => {
    const res = await request(app).get('/api/health').set('Origin', 'https://shop.example.com');
    expect(res.headers['access-control-allow-origin']).toBe('https://shop.example.com');
  });

  it('never allows another origin', async () => {
    const res = await request(app).get('/api/health').set('Origin', 'https://evil.example.com');
    expect(res.headers['access-control-allow-origin']).not.toBe('https://evil.example.com');
  });
});
// Runs before every test file: point the app at the test database.
process.env.DATABASE_URL = 'file:./test.db';
process.env.JWT_SECRET = 'test-secret';

// Tests must never touch the real internet. By default every fetch() fails;
// individual tests override this with mockResolvedValueOnce.
(global as any).fetch = jest.fn(async () => {
  throw new Error('network disabled in tests');
});
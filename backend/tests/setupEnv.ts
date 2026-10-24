// Runs before every test file: point the app at the test database.
process.env.DATABASE_URL = 'file:./test.db';
process.env.JWT_SECRET = 'test-secret';
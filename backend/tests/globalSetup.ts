import { execSync } from 'child_process';

// Runs once before all tests: create a fresh, empty test database.
export default async function globalSetup() {
  execSync('npx prisma db push --force-reset --accept-data-loss --skip-generate', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: 'file:./test.db' },
  });
}
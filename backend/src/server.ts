import 'dotenv/config';
import { app } from './app';
import { ensureAdmin, fillMissingImages, seedDemoVehicles } from './bootstrap';

const PORT = process.env.PORT || 4000;

async function start() {
  const { ADMIN_EMAIL, ADMIN_PASSWORD, SEED_DEMO_DATA } = process.env;
  const seedDemo = SEED_DEMO_DATA === 'true';

  // On a hosting disk that resets, these recreate the admin and the demo cars on every start.
  if (ADMIN_EMAIL && ADMIN_PASSWORD) {
    await ensureAdmin(ADMIN_EMAIL, ADMIN_PASSWORD);
    console.log('Admin account ready');
  }
  if (seedDemo) {
    const added = await seedDemoVehicles();
    if (added > 0) console.log(`Seeded ${added} demo vehicles`);
  }

  app.listen(PORT, () => {
    console.log(`API running on port ${PORT}`);
    // Photo lookups can be slow, so they happen in the background after the server is up.
    if (seedDemo) fillMissingImages().catch((err) => console.error('Image lookup failed', err));
  });
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { prisma } from '../db';

/** One-off script: creates (or promotes) the admin account from environment variables. */
async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD in .env first');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.upsert({
    where: { email },
    update: { role: 'admin', passwordHash },
    create: { name: 'Admin', email, passwordHash, role: 'admin' },
  });
  console.log(`Admin ready: ${email}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
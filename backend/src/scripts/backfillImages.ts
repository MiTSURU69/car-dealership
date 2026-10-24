import 'dotenv/config';
import { prisma } from '../db';
import { findVehicleImage } from '../services/imageService';

/** One-off script: finds photos for every vehicle that doesn't have one yet. */
async function main() {
  const vehicles = await prisma.vehicle.findMany({ where: { imageUrl: null } });
  console.log(`Looking up images for ${vehicles.length} vehicle(s)...`);

  for (const vehicle of vehicles) {
    const imageUrl = await findVehicleImage(vehicle.make, vehicle.model);
    if (imageUrl) {
      await prisma.vehicle.update({ where: { id: vehicle.id }, data: { imageUrl } });
    }
    console.log(`${imageUrl ? 'found  ' : 'missing'}  ${vehicle.make} ${vehicle.model}`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
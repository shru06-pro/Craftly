import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  const stores = await prisma.artisan.findMany({
    select: { id: true, studioName: true, name: true, status: true, avatarUrl: true, bannerUrl: true, badge: true }
  });
  console.log('Total stores in DB:', stores.length);
  const testStores = stores.filter(s => s.studioName.includes('Kabir Handlooms') || s.id.startsWith('store-'));
  console.log('Test/duplicate stores count:', testStores.length);
  for (const s of testStores) {
    console.log('Deleting test store:', s.id, s.studioName);
    // Delete store-related items first
    await prisma.productionMilestone.deleteMany({ where: { orderItem: { storeOrder: { storeId: s.id } } } });
    await prisma.orderItem.deleteMany({ where: { storeOrder: { storeId: s.id } } });
    await prisma.storeOrder.deleteMany({ where: { storeId: s.id } });
    await prisma.customizationRequest.deleteMany({ where: { storeId: s.id } });
    await prisma.productVariant.deleteMany({ where: { product: { artisanId: s.id } } });
    await prisma.media.deleteMany({ where: { product: { artisanId: s.id } } });
    await prisma.product.deleteMany({ where: { artisanId: s.id } });
    await prisma.storeApplication.deleteMany({ where: { storeId: s.id } });
    await prisma.artisan.delete({ where: { id: s.id } });
  }

  const remaining = await prisma.artisan.findMany({
    select: { id: true, studioName: true, name: true, location: true, state: true }
  });
  console.log('Remaining authentic stores count:', remaining.length);
  for (const s of remaining) {
    console.log(' -', s.id, '|', s.studioName, '|', s.name, '|', s.location, s.state);
  }

  await prisma.$disconnect();
}

run().catch(console.error);

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedSettings() {
  console.log('🌱 Seeding settings...');

  try {
    // Seed default settings
    await prisma.setting.upsert({
      where: { key: 'lowStockThreshold' },
      update: {},
      create: {
        key: 'lowStockThreshold',
        value: '10',
      },
    });

    await prisma.setting.upsert({
      where: { key: 'companyName' },
      update: {},
      create: {
        key: 'companyName',
        value: 'SmartInventory Inc.',
      },
    });

    console.log('✅ Settings seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding settings:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedSettings();

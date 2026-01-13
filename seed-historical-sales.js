import prisma from './config/prisma.js';

async function seedHistoricalSales() {
  try {
    const user = await prisma.user.findFirst({ where: { role: 'SUPERADMIN' } });
    if (!user) {
      console.log('No admin user found');
      process.exit(1);
    }

    console.log('Using user: ' + user.name);

    const productId = 1;
    const today = new Date('2026-01-07');
    const paymentMethods = ['CASH', 'MPESA', 'CARD'];

    let totalCreated = 0;

    // Create 30 days of sales
    for (let daysAgo = 30; daysAgo > 0; daysAgo--) {
      const saleDate = new Date(today);
      saleDate.setDate(saleDate.getDate() - daysAgo);

      const numSales = Math.floor(Math.random() * 10) + 5;

      for (let i = 0; i < numSales; i++) {
        const qty = Math.floor(Math.random() * 10) + 1;
        const sale = await prisma.sale.create({
          data: {
            totalAmount: qty * 456.06,
            paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
            userId: user.id,
            createdAt: saleDate,
          }
        });

        await prisma.saleItem.create({
          data: {
            saleId: sale.id,
            productId: productId,
            quantity: qty,
            unitPrice: 456.06,
            total: qty * 456.06
          }
        });

        totalCreated++;
      }
    }

    console.log('✓ Created ' + totalCreated + ' historical sales');
    process.exit(0);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}

seedHistoricalSales();

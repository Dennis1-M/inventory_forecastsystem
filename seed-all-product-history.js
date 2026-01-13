import prisma from './config/prisma.js';

async function seedHistoricalSalesForAllProducts() {
  try {
    const user = await prisma.user.findFirst({ where: { role: 'SUPERADMIN' } });
    if (!user) {
      console.log('No admin user found');
      process.exit(1);
    }

    // Get first 50 products
    const products = await prisma.product.findMany({ take: 50 });
    if (!products.length) {
      console.log('No products found');
      process.exit(1);
    }

    console.log(`Seeding historical sales for ${products.length} products over 30 days...\n`);

    const today = new Date('2026-01-07');
    const paymentMethods = ['CASH', 'MPESA', 'CARD'];
    let totalCreated = 0;

    for (const product of products) {
      let productSalesCount = 0;

      // Create 30 days of sales for each product
      for (let daysAgo = 30; daysAgo > 0; daysAgo--) {
        const saleDate = new Date(today);
        saleDate.setDate(saleDate.getDate() - daysAgo);

        const numSales = Math.floor(Math.random() * 10) + 3; // 3-12 sales per day

        for (let i = 0; i < numSales; i++) {
          const qty = Math.floor(Math.random() * 15) + 1;
          const unitPrice = Math.random() * 200 + 50; // $50-250 per unit

          const sale = await prisma.sale.create({
            data: {
              totalAmount: qty * unitPrice,
              paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
              userId: user.id,
              createdAt: saleDate,
            }
          });

          await prisma.saleItem.create({
            data: {
              saleId: sale.id,
              productId: product.id,
              quantity: qty,
              unitPrice: unitPrice,
              total: qty * unitPrice
            }
          });

          productSalesCount++;
          totalCreated++;
        }
      }

      console.log(`✓ Product ${product.id}: ${productSalesCount} sales created`);
    }

    console.log(`\n✓ Total historical sales created: ${totalCreated}`);
    
    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

seedHistoricalSalesForAllProducts();

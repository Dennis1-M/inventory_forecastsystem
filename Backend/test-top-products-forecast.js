import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';
import prisma from './config/prisma.js';

async function testForecastForTopProducts() {
  try {
    // Get admin user
    const user = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    if (!user) {
      console.log('No admin user found');
      process.exit(1);
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      'supersecretkey123',
      { expiresIn: '24h' }
    );

    // Get top products with sales
    const topProducts = await prisma.saleItem.groupBy({
      by: ['productId'],
      _count: { productId: true },
      orderBy: { _count: { productId: 'desc' } },
      take: 20
    });

    console.log(`Generating forecasts for top ${topProducts.length} products...\n`);

    let successful = 0;
    let failed = 0;

    for (const item of topProducts) {
      try {
        const response = await fetch(`http://localhost:5001/api/forecast/trigger/${item.productId}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ horizon: 14 })
        });

        const data = await response.json();

        if (response.ok) {
          console.log(`✓ Product ${item.productId} (${item._count.productId} sales)`);
          successful++;
        } else {
          console.log(`✗ Product ${item.productId}: ${data.error || 'Unknown error'}`);
          failed++;
        }
      } catch (error) {
        console.log(`✗ Product ${item.productId}: ${error.message}`);
        failed++;
      }
    }

    console.log(`\n✓ Successful: ${successful}`);
    console.log(`✗ Failed: ${failed}`);

    // Check database
    const forecastRunCount = await prisma.forecastRun.count();
    const forecastPointsCount = await prisma.forecastPoint.count();
    
    console.log(`\nDatabase:
  ForecastRun records: ${forecastRunCount}
  ForecastPoint records: ${forecastPointsCount}`);

    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

testForecastForTopProducts();

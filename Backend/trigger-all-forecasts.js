import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';
import prisma from './config/prisma.js';

async function triggerForecastForAllProducts() {
  try {
    // Get admin user
    const user = await prisma.user.findFirst({ where: { role: 'SUPERADMIN' } });
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

    // Get all products with sales
    const products = await prisma.product.findMany({
      include: {
        _count: {
          select: { saleItems: true }
        }
      }
    });

    const productsWithSales = products.filter(p => p._count.saleItems > 0);
    
    console.log(`Generating forecasts for ${productsWithSales.length} products...\n`);

    let successful = 0;
    let failed = 0;

    for (const product of productsWithSales) {
      try {
        const response = await fetch(`http://localhost:5001/api/forecast/trigger/${product.id}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ horizon: 14 })
        });

        const data = await response.json();

        if (response.ok) {
          console.log(`✓ Product ${product.id}: ${product.name}`);
          successful++;
        } else {
          console.log(`✗ Product ${product.id}: ${data.error || 'Unknown error'}`);
          failed++;
        }
      } catch (error) {
        console.log(`✗ Product ${product.id}: ${error.message}`);
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
    process.exit(1);
  }
}

triggerForecastForAllProducts();

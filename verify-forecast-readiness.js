/**
 * Verify Forecast Data Readiness
 * Checks if products have sufficient historical data for forecasting
 */

import colors from 'colors';
import prisma from './config/prisma.js';

async function verifyForecastReadiness() {
  console.log(colors.cyan('\n╔═══════════════════════════════════════════════════════════╗'));
  console.log(colors.cyan('║          Forecast Data Readiness Verification            ║'));
  console.log(colors.cyan('╚═══════════════════════════════════════════════════════════╝\n'));

  try {
    // Get all products
    const products = await prisma.product.findMany({
      take: 20,
      include: {
        category: true
      }
    });

    console.log(colors.yellow(`Checking ${products.length} products...\n`));

    const results = [];

    for (const product of products) {
      // Get historical sales data
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setDate(sixMonthsAgo.getDate() - 180);

      const saleItems = await prisma.saleItem.findMany({
        where: {
          productId: product.id,
          sale: {
            createdAt: { gte: sixMonthsAgo }
          }
        },
        select: {
          quantity: true,
          sale: {
            select: { createdAt: true }
          }
        }
      });

      // Group by date
      const dailyTotals = {};
      saleItems.forEach(({ quantity, sale }) => {
        const date = sale.createdAt.toISOString().split('T')[0];
        dailyTotals[date] = (dailyTotals[date] || 0) + quantity;
      });

      const dataPoints = Object.keys(dailyTotals).length;
      const totalQuantity = Object.values(dailyTotals).reduce((sum, qty) => sum + qty, 0);
      const avgDailySales = dataPoints > 0 ? Math.round(totalQuantity / dataPoints) : 0;

      results.push({
        id: product.id,
        name: product.name,
        category: product.category?.name || 'N/A',
        dataPoints,
        totalQuantity,
        avgDailySales,
        ready: dataPoints >= 30,
        optimal: dataPoints >= 60
      });
    }

    // Display results
    console.log(colors.cyan('📊 Forecast Readiness Report:\n'));
    console.log(colors.white('ID'.padEnd(5) + 'Product'.padEnd(35) + 'Category'.padEnd(20) + 'Days'.padEnd(8) + 'Status'));
    console.log(colors.gray('─'.repeat(100)));

    results.forEach(r => {
      const status = r.optimal 
        ? colors.green('✅ Optimal (60+ days)')
        : r.ready 
          ? colors.yellow('✓ Ready (30+ days)')
          : colors.red(`✗ Insufficient (${r.dataPoints} days)`);
      
      console.log(
        colors.white(String(r.id).padEnd(5)) +
        colors.white(r.name.substring(0, 33).padEnd(35)) +
        colors.gray(r.category.substring(0, 18).padEnd(20)) +
        colors.white(String(r.dataPoints).padEnd(8)) +
        status
      );
    });

    // Summary statistics
    const readyCount = results.filter(r => r.ready).length;
    const optimalCount = results.filter(r => r.optimal).length;
    const insufficientCount = results.filter(r => !r.ready).length;

    console.log(colors.gray('\n' + '─'.repeat(100)));
    console.log(colors.cyan('\n📈 Summary:'));
    console.log(colors.white(`   Products checked: ${results.length}`));
    console.log(colors.green(`   ✅ Optimal (60+ days): ${optimalCount}`));
    console.log(colors.yellow(`   ✓ Ready (30-59 days): ${readyCount - optimalCount}`));
    console.log(colors.red(`   ✗ Insufficient (<30 days): ${insufficientCount}`));

    // Best candidates for forecasting
    console.log(colors.cyan('\n🎯 Best Candidates for Forecasting:'));
    const topCandidates = results
      .filter(r => r.optimal)
      .sort((a, b) => b.dataPoints - a.dataPoints)
      .slice(0, 5);

    topCandidates.forEach((r, idx) => {
      console.log(colors.white(
        `   ${idx + 1}. ${r.name.substring(0, 40).padEnd(40)} - ${r.dataPoints} days, Avg: ${r.avgDailySales}/day`
      ));
    });

    // Overall readiness
    const readinessPercentage = Math.round((readyCount / results.length) * 100);
    console.log(colors.cyan('\n🔋 Overall Readiness:'));
    const progressBar = '█'.repeat(Math.floor(readinessPercentage / 2)) + '░'.repeat(50 - Math.floor(readinessPercentage / 2));
    console.log(colors.white(`   [${progressBar}] ${readinessPercentage}%`));

    if (readinessPercentage >= 80) {
      console.log(colors.green('\n   ✅ Database is ready for forecasting!'));
      console.log(colors.white('\n   Run: node trigger-all-forecasts.js'));
    } else if (readinessPercentage >= 50) {
      console.log(colors.yellow('\n   ⚠️  Partial readiness. Consider running seed-forecast-data.js again.'));
    } else {
      console.log(colors.red('\n   ❌ Insufficient data. Please run: node seed-forecast-data.js'));
    }

    console.log('\n');

  } catch (error) {
    console.error(colors.red('\n❌ Error:'), error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyForecastReadiness();

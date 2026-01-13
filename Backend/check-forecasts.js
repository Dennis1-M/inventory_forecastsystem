import colors from 'colors';
import prisma from './config/prisma.js';

(async () => {
  try {
    const forecastCount = await prisma.forecastRun.count();
    const forecastPointsCount = await prisma.forecastPoint.count();
    const recentForecasts = await prisma.forecastRun.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { 
        product: { select: { name: true } }, 
        points: true 
      }
    });
    
    console.log(colors.cyan('\n📊 Forecast Database Status:'));
    console.log(colors.white(`  Total Forecast Runs: ${forecastCount}`));
    console.log(colors.white(`  Total Forecast Points: ${forecastPointsCount}`));
    
    if (forecastCount === 0) {
      console.log(colors.red('\n❌ No forecasts found in database!'));
      console.log(colors.yellow('\n💡 To generate forecasts, run one of:'));
      console.log(colors.white('  1. Click "Generate Forecasts" button in Manager → Forecasting page'));
      console.log(colors.white('  2. Run: node trigger-all-forecasts.js'));
      console.log(colors.white('  3. POST to /api/forecast/trigger-all endpoint'));
    } else {
      console.log(colors.green(`\n✅ ${forecastCount} forecasts found!`));
      console.log(colors.cyan('\n📅 Recent Forecasts:'));
      recentForecasts.forEach(f => {
        const demand = f.points.reduce((sum, p) => sum + p.predicted, 0);
        console.log(colors.white(
          `  - ${f.product.name}: ${f.points.length} points, ` +
          `Method: ${f.method}, Total Demand: ${Math.round(demand)} units`
        ));
      });
    }
    
    await prisma.$disconnect();
  } catch (error) {
    console.error(colors.red('Error:'), error);
    await prisma.$disconnect();
  }
})();

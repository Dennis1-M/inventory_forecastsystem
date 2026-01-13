import colors from 'colors';
import prisma from './config/prisma.js';

(async () => {
  try {
    console.log(colors.yellow('\nClearing old forecast data...'));
    
    // Delete old forecasts
    await prisma.forecastPoint.deleteMany({});
    await prisma.forecastRun.deleteMany({});
    
    console.log(colors.green('✅ Old forecast data cleared\n'));
    
    await prisma.$disconnect();
  } catch (error) {
    console.error(colors.red('Error:'), error);
    await prisma.$disconnect();
  }
})();

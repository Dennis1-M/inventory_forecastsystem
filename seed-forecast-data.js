/**
 * Comprehensive Data Seeding for Forecasting
 * Generates realistic historical sales data for all products
 * Ensures minimum 90 days of data for accurate forecasting
 */

import colors from 'colors';
import prisma from './config/prisma.js';

// Configuration
const DAYS_OF_HISTORY = 90; // 3 months of data
const START_DATE = new Date('2025-10-14'); // 90 days before Jan 12, 2026
const END_DATE = new Date('2026-01-12'); // Today

// Sales patterns by product category
const CATEGORY_PATTERNS = {
  'Food & Beverages': { avgSales: 25, variance: 10, weekendBoost: 1.3 },
  'Electronics': { avgSales: 8, variance: 5, weekendBoost: 1.2 },
  'Clothing': { avgSales: 12, variance: 6, weekendBoost: 1.4 },
  'Home & Garden': { avgSales: 10, variance: 4, weekendBoost: 1.1 },
  'Health & Beauty': { avgSales: 15, variance: 7, weekendBoost: 1.2 },
  'Sports & Outdoors': { avgSales: 9, variance: 5, weekendBoost: 1.5 },
  'default': { avgSales: 10, variance: 5, weekendBoost: 1.2 }
};

// Generate realistic sales quantity with patterns
function generateSalesQuantity(baseAvg, variance, isWeekend, isMonthEnd, seasonalFactor) {
  let quantity = baseAvg + (Math.random() * variance * 2 - variance);
  
  // Weekend boost
  if (isWeekend) quantity *= (1 + Math.random() * 0.3);
  
  // Month-end boost (people get paid)
  if (isMonthEnd) quantity *= 1.2;
  
  // Seasonal factor
  quantity *= seasonalFactor;
  
  // Add some randomness
  quantity *= (0.8 + Math.random() * 0.4);
  
  return Math.max(1, Math.round(quantity));
}

// Get seasonal factor based on date
function getSeasonalFactor(date) {
  const month = date.getMonth();
  // Holiday season (Nov-Dec): 1.3x, Summer (June-Aug): 1.1x, Other: 1.0x
  if (month >= 10) return 1.3; // Nov-Dec
  if (month >= 5 && month <= 7) return 1.1; // Jun-Aug
  return 1.0;
}

// Check if date is weekend
function isWeekend(date) {
  const day = date.getDay();
  return day === 0 || day === 6;
}

// Check if date is near month end
function isMonthEnd(date) {
  const day = date.getDate();
  return day >= 25;
}

async function seedForecastData() {
  console.log(colors.cyan('\n╔═══════════════════════════════════════════════════════════╗'));
  console.log(colors.cyan('║       Seeding Historical Data for Forecasting            ║'));
  console.log(colors.cyan('╚═══════════════════════════════════════════════════════════╝\n'));

  try {
    // Get or create admin user
    let user = await prisma.user.findFirst({ 
      where: { role: { in: ['SUPERADMIN', 'ADMIN'] } } 
    });

    if (!user) {
      console.log(colors.yellow('Creating admin user...'));
      user = await prisma.user.create({
        data: {
          name: 'System Admin',
          email: 'admin@system.com',
          password: 'hashed_password',
          role: 'SUPERADMIN'
        }
      });
    }

    console.log(colors.green(`✅ Using user: ${user.name} (${user.email})\n`));

    // Get all products with their categories
    const products = await prisma.product.findMany({
      include: {
        category: true
      },
      take: 100 // Seed for first 100 products
    });

    if (products.length === 0) {
      console.log(colors.red('❌ No products found. Please seed products first.'));
      process.exit(1);
    }

    console.log(colors.cyan(`📦 Found ${products.length} products`));
    console.log(colors.cyan(`📅 Generating sales from ${START_DATE.toDateString()} to ${END_DATE.toDateString()}`));
    console.log(colors.cyan(`⏱️  This will take a few minutes...\n`));

    const paymentMethods = ['CASH', 'MPESA', 'CARD'];
    let totalSalesCreated = 0;
    let totalItemsCreated = 0;
    const productProgress = [];

    // Process each product
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const categoryName = product.category?.name || 'default';
      const pattern = CATEGORY_PATTERNS[categoryName] || CATEGORY_PATTERNS.default;
      
      let productSalesCount = 0;
      let productItemsCount = 0;

      // Generate sales for each day
      for (let d = 0; d < DAYS_OF_HISTORY; d++) {
        const saleDate = new Date(START_DATE);
        saleDate.setDate(saleDate.getDate() + d);
        
        const isWE = isWeekend(saleDate);
        const isME = isMonthEnd(saleDate);
        const seasonal = getSeasonalFactor(saleDate);
        
        // Determine number of transactions for this day
        const numTransactions = Math.max(1, Math.round(
          (2 + Math.random() * 8) * (isWE ? 1.3 : 1.0)
        ));

        // Create transactions
        for (let t = 0; t < numTransactions; t++) {
          const quantity = generateSalesQuantity(
            pattern.avgSales,
            pattern.variance,
            isWE,
            isME,
            seasonal
          );

          const unitPrice = product.sellingPrice || 100;
          const total = quantity * unitPrice;

          // Random hour within business hours (8 AM - 8 PM)
          const hour = 8 + Math.floor(Math.random() * 12);
          const minute = Math.floor(Math.random() * 60);
          const transactionDate = new Date(saleDate);
          transactionDate.setHours(hour, minute, 0, 0);

          try {
            // Create sale
            const sale = await prisma.sale.create({
              data: {
                totalAmount: total,
                paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
                userId: user.id,
                createdAt: transactionDate,
              }
            });

            // Create sale item
            await prisma.saleItem.create({
              data: {
                saleId: sale.id,
                productId: product.id,
                quantity: quantity,
                unitPrice: unitPrice,
                total: total
              }
            });

            productSalesCount++;
            productItemsCount += quantity;
          } catch (err) {
            // Skip duplicates or errors silently to speed up
            continue;
          }
        }
      }

      totalSalesCreated += productSalesCount;
      totalItemsCreated += productItemsCount;

      // Progress indicator
      const progress = Math.round(((i + 1) / products.length) * 100);
      const progressBar = '█'.repeat(Math.floor(progress / 2)) + '░'.repeat(50 - Math.floor(progress / 2));
      
      process.stdout.write(`\r[${progressBar}] ${progress}% | Product ${i + 1}/${products.length} | ${product.name.substring(0, 30).padEnd(30)} | ${productSalesCount} sales`);

      productProgress.push({
        name: product.name,
        sales: productSalesCount,
        items: productItemsCount
      });
    }

    console.log('\n');
    console.log(colors.green('\n╔═══════════════════════════════════════════════════════════╗'));
    console.log(colors.green('║               Seeding Completed Successfully!             ║'));
    console.log(colors.green('╚═══════════════════════════════════════════════════════════╝\n'));

    console.log(colors.cyan('📊 Summary:'));
    console.log(colors.white(`   Products processed: ${products.length}`));
    console.log(colors.white(`   Total sales created: ${totalSalesCreated.toLocaleString()}`));
    console.log(colors.white(`   Total items sold: ${totalItemsCreated.toLocaleString()}`));
    console.log(colors.white(`   Days of history: ${DAYS_OF_HISTORY}`));
    console.log(colors.white(`   Average sales per product: ${Math.round(totalSalesCreated / products.length)}`));

    // Top 10 products by sales
    console.log(colors.cyan('\n🏆 Top 10 Products by Sales Volume:'));
    const topProducts = productProgress
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 10);
    
    topProducts.forEach((p, idx) => {
      console.log(colors.white(`   ${idx + 1}. ${p.name.substring(0, 40).padEnd(40)} - ${p.sales} sales (${p.items} items)`));
    });

    // Verify forecast readiness
    console.log(colors.cyan('\n🔍 Verifying Forecast Readiness:'));
    const sampleProduct = products[0];
    const historicalData = await getHistoricalSalesData(sampleProduct.id);
    
    console.log(colors.white(`   Sample Product: ${sampleProduct.name}`));
    console.log(colors.white(`   Historical Data Points: ${historicalData.length}`));
    
    if (historicalData.length >= 30) {
      console.log(colors.green('   ✅ Sufficient data for forecasting (need 30+ days)'));
      console.log(colors.green('   ✅ Ready to run forecasts!'));
    } else {
      console.log(colors.yellow(`   ⚠️  Only ${historicalData.length} days of data. Need 30+ for accurate forecasts.`));
    }

    console.log(colors.cyan('\n💡 Next Steps:'));
    console.log(colors.white('   1. Start the backend: npm run dev'));
    console.log(colors.white('   2. Test forecast for a product:'));
    console.log(colors.gray('      curl -X POST http://localhost:5001/api/forecast/run \\'));
    console.log(colors.gray('        -H "Authorization: Bearer <token>" \\'));
    console.log(colors.gray('        -H "Content-Type: application/json" \\'));
    console.log(colors.gray('        -d \'{"productId": 1, "horizon": 14}\''));
    console.log(colors.white('   3. Or trigger all forecasts:'));
    console.log(colors.gray('      node trigger-all-forecasts.js\n'));

  } catch (error) {
    console.error(colors.red('\n❌ Error during seeding:'), error);
    console.log(colors.yellow('Stack trace:'), error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

// Helper function to get historical sales data
async function getHistoricalSalesData(productId) {
  const saleItems = await prisma.saleItem.findMany({
    where: {
      productId,
      sale: {
        createdAt: {
          gte: START_DATE,
          lte: END_DATE
        }
      }
    },
    select: {
      quantity: true,
      sale: {
        select: { createdAt: true }
      }
    }
  });

  const dailyTotals = {};
  saleItems.forEach(({ quantity, sale }) => {
    const date = sale.createdAt.toISOString().split('T')[0];
    dailyTotals[date] = (dailyTotals[date] || 0) + quantity;
  });

  return Object.entries(dailyTotals)
    .map(([date, quantity]) => ({ date, quantity }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));
}

// Run the seeder
seedForecastData();

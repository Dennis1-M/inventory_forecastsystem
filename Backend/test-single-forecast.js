/**
 * Test Single Forecast
 * Quick test to verify forecasting works end-to-end
 */

import colors from 'colors';

const API_URL = 'http://localhost:5001';

async function testSingleForecast() {
  console.log(colors.cyan('\n╔═══════════════════════════════════════════════════════════╗'));
  console.log(colors.cyan('║              Testing Single Product Forecast             ║'));
  console.log(colors.cyan('╚═══════════════════════════════════════════════════════════╝\n'));

  try {
    // First, login to get a token
    console.log(colors.yellow('Step 1: Authenticating...'));
    const loginResponse = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'jamaldoe@gmail.com',
        password: 'password123'
      })
    });

    if (!loginResponse.ok) {
      console.log(colors.red('❌ Login failed. Make sure the backend is running.'));
      console.log(colors.yellow('   Start backend: cd Backend && npm run dev'));
      return;
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log(colors.green('✅ Authenticated successfully\n'));

    // Test forecast for product ID 1
    const productId = 1;
    const horizon = 14; // 14-day forecast

    console.log(colors.yellow(`Step 2: Running forecast for Product ID ${productId}...`));
    console.log(colors.gray(`   Horizon: ${horizon} days`));
    console.log(colors.gray(`   Endpoint: POST ${API_URL}/api/forecast/run\n`));

    const forecastResponse = await fetch(`${API_URL}/api/forecast/run`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        productId: productId,
        horizon: horizon
      })
    });

    if (!forecastResponse.ok) {
      const errorText = await forecastResponse.text();
      console.log(colors.red(`❌ Forecast failed (${forecastResponse.status})`));
      console.log(colors.yellow('Error details:'), errorText);
      
      if (forecastResponse.status === 503) {
        console.log(colors.yellow('\n💡 Tip: Make sure the Python FastAPI server is running:'));
        console.log(colors.gray('   cd Backend/forecast2'));
        console.log(colors.gray('   python app.py'));
      }
      return;
    }

    const forecastData = await forecastResponse.json();
    console.log(colors.green('✅ Forecast completed successfully!\n'));

    // Display results
    console.log(colors.cyan('📊 Forecast Results:'));
    console.log(colors.white(`   Product ID: ${productId}`));
    console.log(colors.white(`   Forecast Horizon: ${horizon} days`));
    console.log(colors.white(`   Model Used: ${forecastData.model || 'N/A'}`));
    
    if (forecastData.predictions && Array.isArray(forecastData.predictions)) {
      console.log(colors.white(`   Total Predictions: ${forecastData.predictions.length}`));
      
      // Show first 7 days of predictions
      console.log(colors.cyan('\n📅 Next 7 Days Forecast:'));
      const predictions = forecastData.predictions.slice(0, 7);
      predictions.forEach((pred, idx) => {
        const day = idx + 1;
        const quantity = typeof pred === 'object' ? pred.quantity : pred;
        console.log(colors.white(`   Day ${day}: ${Math.round(quantity)} units`));
      });

      // Calculate totals
      const total14DayForecast = forecastData.predictions
        .reduce((sum, pred) => {
          const qty = typeof pred === 'object' ? pred.quantity : pred;
          return sum + qty;
        }, 0);
      
      console.log(colors.cyan('\n📈 Summary:'));
      console.log(colors.white(`   14-Day Total Forecast: ${Math.round(total14DayForecast)} units`));
      console.log(colors.white(`   Average Daily Forecast: ${Math.round(total14DayForecast / 14)} units/day`));
    }

    // Show model metrics if available
    if (forecastData.metrics) {
      console.log(colors.cyan('\n🎯 Model Accuracy Metrics:'));
      if (forecastData.metrics.mae) {
        console.log(colors.white(`   MAE: ${forecastData.metrics.mae.toFixed(2)}`));
      }
      if (forecastData.metrics.rmse) {
        console.log(colors.white(`   RMSE: ${forecastData.metrics.rmse.toFixed(2)}`));
      }
      if (forecastData.metrics.accuracy) {
        console.log(colors.white(`   Accuracy: ${forecastData.metrics.accuracy.toFixed(2)}%`));
      }
    }

    console.log(colors.green('\n✅ Test completed successfully!'));
    console.log(colors.cyan('\n💡 Next Steps:'));
    console.log(colors.white('   • Run forecasts for all products: node trigger-all-forecasts.js'));
    console.log(colors.white('   • View forecasts in Manager Dashboard'));
    console.log(colors.white('   • Check alerts for products needing restock\n'));

  } catch (error) {
    console.error(colors.red('\n❌ Error during test:'), error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log(colors.yellow('\n💡 Backend is not running. Start it with:'));
      console.log(colors.gray('   cd Backend && npm run dev\n'));
    }
  }
}

testSingleForecast();

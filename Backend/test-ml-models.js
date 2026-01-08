// test-ml-models.js
// Test script for ML forecasting models

import { runForecastModel } from './forecast2/models/modelSelector.js';

// Generate sample sales data
function generateSampleData(days = 90) {
    const data = [];
    const baseDate = new Date('2024-01-01');
    
    for (let i = 0; i < days; i++) {
        const date = new Date(baseDate);
        date.setDate(date.getDate() + i);
        
        // Simulate seasonal pattern with noise
        const seasonality = 50 + 20 * Math.sin((i / 7) * Math.PI); // Weekly pattern
        const trend = i * 0.5; // Slight upward trend
        const noise = Math.random() * 10 - 5; // Random noise
        const quantity = Math.max(0, Math.round(seasonality + trend + noise));
        
        data.push({
            date: date.toISOString().split('T')[0],
            quantity
        });
    }
    
    return data;
}

async function testModels() {
    console.log('🧪 Testing ML Forecasting Models\n');
    console.log('='.repeat(60));
    
    // Generate sample data
    const sampleData = generateSampleData(90);
    console.log(`\n📊 Generated ${sampleData.length} days of sample sales data`);
    console.log(`Date range: ${sampleData[0].date} to ${sampleData[sampleData.length - 1].date}`);
    console.log(`Average daily sales: ${(sampleData.reduce((sum, d) => sum + d.quantity, 0) / sampleData.length).toFixed(2)}`);
    
    const models = [
        { name: 'Moving Average', type: 'moving_average' },
        { name: 'Exponential Smoothing', type: 'exponential_smoothing' },
        { name: 'Linear Regression', type: 'linear_regression' },
        { name: 'XGBoost', type: 'xgboost' },
        { name: 'LSTM (Experimental)', type: 'lstm' }
    ];
    
    for (const model of models) {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`🤖 Testing: ${model.name}`);
        console.log('-'.repeat(60));
        
        try {
            const startTime = Date.now();
            const result = await runForecastModel(sampleData, 14, model.type);
            const duration = Date.now() - startTime;
            
            console.log(`✅ Success! (${duration}ms)`);
            console.log(`   Method: ${result.method}`);
            console.log(`   Predictions: ${result.points.length} days`);
            
            if (result.metrics) {
                console.log(`   Metrics:`, result.metrics);
            }
            
            if (result.fallback) {
                console.log(`   ⚠️  Fallback used due to: ${result.originalError}`);
            }
            
            // Show first 3 predictions
            console.log('\n   Sample predictions:');
            result.points.slice(0, 3).forEach(p => {
                console.log(`   Day ${p.period}: ${p.predicted.toFixed(2)} (${p.lower95?.toFixed(2)} - ${p.upper95?.toFixed(2)})`);
            });
            
        } catch (error) {
            console.log(`❌ Error: ${error.message}`);
            if (error.message.includes('TensorFlow')) {
                console.log('   ℹ️  TensorFlow not installed (expected for LSTM)');
            } else if (error.message.includes('xgboost')) {
                console.log('   ℹ️  XGBoost not installed');
            }
        }
    }
    
    console.log(`\n${'='.repeat(60)}`);
    console.log('✨ Testing complete!\n');
}

// Run tests
testModels().catch(console.error);

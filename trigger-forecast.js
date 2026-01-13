import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';
import prisma from './config/prisma.js';

async function triggerForecast() {
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

    console.log('Triggering forecast for product 1...');
    
    const response = await fetch('http://localhost:5001/api/forecast/trigger/1', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ horizon: 14 })
    });

    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));

    if (response.ok) {
      // Check database for created forecast
      const forecastCount = await prisma.forecastRun.count();
      const forecastPointsCount = await prisma.forecastPoint.count();
      
      console.log('\nDatabase check:');
      console.log('ForecastRun records:', forecastCount);
      console.log('ForecastPoint records:', forecastPointsCount);
    }

    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

triggerForecast();

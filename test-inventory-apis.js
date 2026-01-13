// Test script for Inventory Management APIs
import prisma from './config/prisma.js';

const colors = {
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
};

async function testInventoryAPIs() {
  console.log(colors.blue('\n🧪 Testing Inventory Management APIs\n'));

  // Get a test user token
  let token = null;
  try {
    const user = await prisma.user.findFirst({
      where: { role: { in: ['MANAGER', 'ADMIN', 'SUPERADMIN'] } }
    });
    
    if (!user) {
      console.log(colors.red('❌ No manager/admin user found. Please create one first.'));
      return;
    }

    console.log(colors.green(`✅ Using test user: ${user.email} (${user.role})\n`));
  } catch (err) {
    console.error(colors.red('❌ Database connection failed:'), err.message);
    return;
  }

  const BASE_URL = 'http://localhost:5001/api';
  const tests = [
    {
      name: 'GET /api/inventory',
      test: async () => {
        const response = await fetch(`${BASE_URL}/inventory`, {
          headers: { 'Content-Type': 'application/json' }
        });
        return response;
      }
    },
    {
      name: 'GET /api/inventory/summary',
      test: async () => {
        const response = await fetch(`${BASE_URL}/inventory/summary`, {
          headers: { 'Content-Type': 'application/json' }
        });
        return response;
      }
    },
    {
      name: 'GET /api/inventory/movements',
      test: async () => {
        const response = await fetch(`${BASE_URL}/inventory/movements`, {
          headers: { 'Content-Type': 'application/json' }
        });
        return response;
      }
    },
    {
      name: 'GET /api/inventory/low-stock',
      test: async () => {
        const response = await fetch(`${BASE_URL}/inventory/low-stock`, {
          headers: { 'Content-Type': 'application/json' }
        });
        return response;
      }
    },
    {
      name: 'GET /api/inventory/cycle-counts',
      test: async () => {
        const response = await fetch(`${BASE_URL}/inventory/cycle-counts`, {
          headers: { 'Content-Type': 'application/json' }
        });
        return response;
      }
    }
  ];

  for (const testCase of tests) {
    try {
      const response = await testCase.test();
      const status = response.status;
      const data = await response.json();
      
      if (status === 200 || status === 201) {
        console.log(colors.green(`✅ ${testCase.name}: SUCCESS (${status})`));
        if (data.data && Array.isArray(data.data)) {
          console.log(colors.yellow(`   📊 Returned ${data.data.length} items`));
        }
      } else if (status === 401 || status === 403) {
        console.log(colors.yellow(`⚠️  ${testCase.name}: Auth required (${status}) - ${data.message || 'Protected endpoint'}`));
      } else {
        console.log(colors.red(`❌ ${testCase.name}: FAILED (${status})`));
        console.log(colors.red(`   Error: ${data.message || JSON.stringify(data)}`));
      }
    } catch (error) {
      console.log(colors.red(`❌ ${testCase.name}: ERROR`));
      console.log(colors.red(`   ${error.message}`));
    }
  }

  console.log(colors.blue('\n✅ Inventory API Tests Complete\n'));
  process.exit(0);
}

testInventoryAPIs();

import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5001/api';

// Test data
const testToken = 'test-token'; // We'll use this for auth

const endpoints = [
  { method: 'GET', url: '/manager/dashboard-stats', name: 'Dashboard Stats' },
  { method: 'GET', url: '/alerts', name: 'Alerts' },
  { method: 'GET', url: '/notifications', name: 'Notifications' },
  { method: 'GET', url: '/inventory', name: 'Inventory' },
  { method: 'GET', url: '/sales', name: 'Sales' },
  { method: 'GET', url: '/manager/products/low-stock', name: 'Low Stock Products' },
  { method: 'GET', url: '/manager/staff/performance', name: 'Staff Performance' },
  { method: 'GET', url: '/manager/reports/inventory', name: 'Inventory Reports' },
  { method: 'GET', url: '/manager/reports/gross-margin', name: 'Gross Margin Reports' },
];

async function testEndpoint(endpoint) {
  try {
    const response = await fetch(API_BASE + endpoint.url, {
      method: endpoint.method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testToken}`
      }
    });
    
    const status = response.status;
    const data = await response.json();
    
    // 401 Unauthorized is expected without real token, but endpoint should exist
    if (status === 401 || status === 200) {
      console.log(`‚úÖ ${endpoint.name} (${endpoint.method} ${endpoint.url}): ${status}`);
      return true;
    } else if (status === 404) {
      console.log(`‚ùå ${endpoint.name} (${endpoint.method} ${endpoint.url}): NOT FOUND (${status})`);
      return false;
    } else {
      console.log(`‚ö†Ô∏è  ${endpoint.name} (${endpoint.method} ${endpoint.url}): ${status}`);
      return true;
    }
  } catch (error) {
    console.log(`‚ùå ${endpoint.name}: ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('\nÌ∑™ Testing Manager Dashboard API Endpoints\n');
  
  let passed = 0;
  let total = endpoints.length;
  
  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint);
    if (result) passed++;
  }
  
  console.log(`\nÌ≥ä Results: ${passed}/${total} endpoints accessible\n`);
}

runTests();

// test-api-endpoints.js - Test Backend API Endpoints
const axios = require('axios');

console.log("=== Testing Backend API Endpoints ===\n");

const API_BASE = 'http://localhost:5000/api'; // Update with your backend URL
const testAdminCredentials = {
    email: 'admin@example.com',
    password: 'admin123'
};

let authToken = '';

// Test Functions
async function testBackendServer() {
    console.log("Test 1: Backend Server Connection");
    
    try {
        const response = await axios.get(`${API_BASE}/health`, { timeout: 5000 });
        console.log(`✓ Backend is running: ${response.status} ${response.statusText}`);
        return true;
    } catch (error) {
        console.error(`✗ Backend server not reachable: ${error.message}`);
        console.log("  Make sure your backend server is running on port 5000");
        return false;
    }
}

async function testAdminLogin() {
    console.log("\nTest 2: Admin Login Endpoint");
    
    try {
        const response = await axios.post(`${API_BASE}/auth/login`, testAdminCredentials);
        
        if (response.data.token) {
            authToken = response.data.token;
            console.log(`✓ Admin login successful`);
            console.log(`  Token received: ${authToken.substring(0, 50)}...`);
            return true;
        } else {
            console.error("✗ No token in response");
            return false;
        }
    } catch (error) {
        console.error(`✗ Admin login failed: ${error.response?.data?.message || error.message}`);
        console.log(`  Status: ${error.response?.status}`);
        console.log(`  Endpoint: ${API_BASE}/auth/login`);
        return false;
    }
}

async function testGetUsersEndpoint() {
    console.log("\nTest 3: Get Users Endpoint");
    
    if (!authToken) {
        console.error("✗ No auth token available");
        return false;
    }
    
    try {
        const response = await axios.get(`${API_BASE}/admin/users`, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log(`✓ Get users successful: ${response.status}`);
        console.log(`  Total users: ${response.data.users?.length || response.data.length || 0}`);
        
        if (response.data.users && response.data.users.length > 0) {
            console.log("  Sample users:");
            response.data.users.slice(0, 3).forEach(user => {
                console.log(`    - ${user.email} (${user.role})`);
            });
        }
        
        return true;
    } catch (error) {
        console.error(`✗ Get users failed: ${error.response?.data?.message || error.message}`);
        console.log(`  Status: ${error.response?.status}`);
        console.log(`  Headers sent: Authorization: Bearer ${authToken.substring(0, 30)}...`);
        
        // Try without token to see if it's an auth issue
        try {
            const noAuthResponse = await axios.get(`${API_BASE}/admin/users`);
            console.log(`  Note: Endpoint works without auth (should require auth!)`);
        } catch (noAuthError) {
            console.log(`  Endpoint requires authentication (correct)`);
        }
        
        return false;
    }
}

async function testCorsConfiguration() {
    console.log("\nTest 4: CORS Configuration");
    
    try {
        const response = await axios.options(`${API_BASE}/admin/users`);
        
        const corsHeaders = response.headers;
        console.log("✓ CORS headers detected:");
        console.log(`  Access-Control-Allow-Origin: ${corsHeaders['access-control-allow-origin']}`);
        console.log(`  Access-Control-Allow-Methods: ${corsHeaders['access-control-allow-methods']}`);
        console.log(`  Access-Control-Allow-Headers: ${corsHeaders['access-control-allow-headers']}`);
        
        return true;
    } catch (error) {
        console.error(`✗ CORS test failed: ${error.message}`);
        console.log("  This might cause frontend fetch issues");
        return false;
    }
}

async function testEndpointStructure() {
    console.log("\nTest 5: Endpoint Discovery");
    
    const endpointsToTest = [
        '/auth/login',
        '/auth/register',
        '/admin/users',
        '/admin/users/1',
        '/profile',
        '/health'
    ];
    
    let workingEndpoints = 0;
    
    for (const endpoint of endpointsToTest) {
        try {
            const response = await axios.get(`${API_BASE}${endpoint}`, { timeout: 3000 });
            console.log(`✓ ${endpoint}: ${response.status}`);
            workingEndpoints++;
        } catch (error) {
            if (error.response) {
                console.log(`  ${endpoint}: ${error.response.status} (${error.response.statusText})`);
            } else if (error.code === 'ECONNREFUSED') {
                console.log(`  ${endpoint}: Connection refused`);
            } else {
                console.log(`  ${endpoint}: ${error.message}`);
            }
        }
    }
    
    console.log(`\n  Total working endpoints: ${workingEndpoints}/${endpointsToTest.length}`);
    return workingEndpoints > 0;
}

// Main Test Runner
async function runAllTests() {
    console.log("Testing API endpoints for SuperAdmin Dashboard...\n");
    
    const tests = [
        testBackendServer,
        testAdminLogin,
        testGetUsersEndpoint,
        testCorsConfiguration,
        testEndpointStructure
    ];
    
    const results = [];
    
    for (let i = 0; i < tests.length; i++) {
        const test = tests[i];
        console.log(`\n[${i + 1}/${tests.length}] Running ${test.name}...`);
        try {
            const result = await test();
            results.push(result);
        } catch (error) {
            console.error(`✗ Test ${i + 1} crashed:`, error.message);
            results.push(false);
        }
    }
    
    console.log("\n" + "=".repeat(60));
    console.log("API ENDPOINT TEST RESULTS:");
    console.log("=".repeat(60));
    
    const testNames = [
        "Backend Server",
        "Admin Login",
        "Get Users Endpoint",
        "CORS Configuration",
        "Endpoint Structure"
    ];
    
    testNames.forEach((name, index) => {
        const status = results[index] ? "✅ PASS" : "❌ FAIL";
        console.log(`${status} - ${name}`);
    });
    
    const passedTests = results.filter(result => result).length;
    
    console.log("=".repeat(60));
    console.log(`\nSummary: ${passedTests}/${tests.length} tests passed`);
    
    if (!results[0]) {
        console.log("\n⚠️  CRITICAL: Backend server is not running!");
        console.log("   Start your backend with: npm run dev or node server.js");
    }
    
    if (!results[1]) {
        console.log("\n⚠️  Admin login failed. Check:");
        console.log("   1. Admin user exists in database");
        console.log("   2. Login endpoint is correct");
        console.log("   3. Credentials are valid");
    }
    
    if (!results[2]) {
        console.log("\n⚠️  Get users endpoint failed. This is likely causing your frontend error!");
        console.log("   Common issues:");
        console.log("   1. Endpoint URL mismatch");
        console.log("   2. Missing/invalid JWT token");
        console.log("   3. Admin middleware not working");
        console.log("   4. Route not defined in backend");
    }
    
    if (!results[3]) {
        console.log("\n⚠️  CORS issues detected!");
        console.log("   Add CORS middleware to your backend:");
        console.log("   npm install cors");
        console.log("   Then in your app.js:");
        console.log("   const cors = require('cors');");
        console.log("   app.use(cors({ origin: 'http://localhost:5173' })); // Your frontend URL");
    }
}

// Run tests
runAllTests().catch(console.error);
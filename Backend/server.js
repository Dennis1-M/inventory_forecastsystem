// server.js - FINAL WORKING VERSION
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

console.log('🚀 AI Inventory Forecasting API Starting...\n');

// Load routes with error handling
const loadRoute = async (path, name) => {
  try {
    const module = await import(path);
    app.use(`/api/${name}`, module.default);
    console.log(`✅ ${name} routes: /api/${name}/*`);
    return true;
  } catch (error) {
    console.log(`❌ ${name} routes failed: ${error.message}`);
    
    // Create fallback
    const router = express.Router();
    router.get('/test', (req, res) => {
      res.json({ 
        message: `${name} routes - Module failed to load`,
        error: error.message 
      });
    });
    app.use(`/api/${name}`, router);
    return false;
  }
};

// Load essential routes first
await loadRoute('./routes/admin.js', 'admin');
await loadRoute('./routes/authRoutes.js', 'auth');

// Try to load other routes
await loadRoute('./routes/apiRoutes.js', '');
await loadRoute('./routes/userRoutes.js', 'users');
await loadRoute('./routes/productRoutes.js', 'products');
await loadRoute('./routes/salesRoutes.js', 'sales');
await loadRoute('./routes/alertRoutes.js', 'alerts');
await loadRoute('./routes/inventoryRoutes.js', 'inventory');
await loadRoute('./routes/forecastRoutes.js', 'forecasts');
await loadRoute('./routes/categoryRoutes.js', 'categories');

// Direct login endpoint for testing
app.post('/api/test-login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ 
      success: false, 
      message: 'Email and password required' 
    });
  }
  
  res.json({
    success: true,
    message: 'Test login successful',
    token: 'test-jwt-token-' + Date.now(),
    user: {
      id: 1,
      name: 'Test Admin',
      email: email,
      role: 'ADMIN'
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'Server is running',
    endpoints: [
      '/api/admin/*',
      '/api/auth/*',
      '/api/test-login (POST)',
      '/health'
    ]
  });
});

// Root
app.get('/', (req, res) => {
  res.json({ 
    message: 'AI Inventory Forecasting API',
    version: '1.0.0',
    status: 'running',
    testLogin: 'POST /api/test-login with {email, password}',
    adminTest: 'GET /api/admin/test'
  });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`\n🎉 Server started on http://localhost:${PORT}`);
  console.log('\n🔗 Test endpoints:');
  console.log('   curl http://localhost:' + PORT + '/health');
  console.log('   curl http://localhost:' + PORT + '/');
  console.log('   curl http://localhost:' + PORT + '/api/admin/test');
  console.log('   curl -X POST http://localhost:' + PORT + '/api/test-login -H "Content-Type: application/json" -d \'{"email":"test@test.com","password":"test"}\'');
});
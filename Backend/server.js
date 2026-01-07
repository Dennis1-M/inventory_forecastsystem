// server.js - FINAL FIXED VERSION (CORS + ROUTES WORKING)
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
dotenv.config();

const app = express();

/* ===============================
   MIDDLEWARE
================================ */

// ✅ Correct CORS for credentials
app.use(
  cors({
    origin: "http://localhost:5173", // frontend
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

console.log("🚀 AI Inventory Forecasting API Starting...\n");

/* ===============================
   ROUTE LOADER
================================ */

const loadRoute = async (path, name) => {
  try {
    const module = await import(path);
    app.use(`/api/${name}`, module.default);
    console.log(`✅ ${name || "root"} routes loaded at /api/${name}`);
  } catch (error) {
    console.error(`❌ Failed to load ${name} routes`, error.message);

    const router = express.Router();
    router.get("/test", (req, res) => {
      res.json({
        success: false,
        message: `${name} routes failed to load`,
        error: error.message,
      });
    });
    app.use(`/api/${name}`, router);
  }
};

/* ===============================
   LOAD ROUTES
================================ */

await loadRoute("./routes/authRoutes.js", "auth");
await loadRoute("./routes/admin.js", "admin");
await loadRoute("./routes/userRoutes.js", "users");
await loadRoute("./routes/productRoutes.js", "products");
await loadRoute("./routes/salesRoutes.js", "sales");
await loadRoute("./routes/syncRoutes.js", "sync");
await loadRoute("./routes/purchaseOrderRoutes.js", "purchase-orders");
await loadRoute("./routes/alertRoutes.js", "alerts");
await loadRoute("./routes/inventoryRoutes.js", "inventory");
await loadRoute("./routes/manager.js", "manager");
await loadRoute("./routes/forecastRoutes.js", "forecast");
await loadRoute("./routes/forecastTriggerRoutes.js", "forecast-trigger");
await loadRoute("./routes/categoryRoutes.js", "categories");
await loadRoute("./routes/dashboardRoutes.js", "dashboard");
await loadRoute("./routes/mpesaRoutes.js", "mpesa");
await loadRoute("./routes/exportRoutes.js", "export");
await loadRoute("./routes/healthRoutes.js", "health-status");
await loadRoute("./routes/settingsRoutes.js", "settings");
await loadRoute("./routes/setupRoutes.js", "setup");
await loadRoute("./routes/notificationsRoutes.js", "notifications");
await loadRoute("./routes/activityLogsRoutes.js", "activity-logs");
await loadRoute("./routes/staffActivitiesRoutes.js", "staff-activities");
await loadRoute("./routes/reportsRoutes.js", "reports");
await loadRoute("./routes/apiRoutes.js", "api");

/* ===============================
   TEST / HEALTH ROUTES
================================ */

// Test login (debug only)
app.post("/api/test-login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password required",
    });
  }

  res.json({
    success: true,
    message: "Test login successful",
    token: "test-token-" + Date.now(),
    user: {
      id: "1",
      name: "Test Admin",
      email,
      role: "ADMIN",
    },
  });
});

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    message: "Server running correctly",
  });
});

// Root
app.get("/", (req, res) => {
  res.json({
    name: "AI Inventory Forecasting API",
    version: "1.0.0",
    status: "running",
  });
});

/* ===============================
   START SERVER
================================ */
import { createServer } from 'http';
import { initSockets } from './sockets/index.js';

const PORT = process.env.PORT || 5001;

if (process.env.NODE_ENV !== 'test') {
  const server = createServer(app);
  // Initialize socket.io
  initSockets(server);

  server.listen(PORT, () => {
    console.log(`\n🎉 Server running on http://localhost:${PORT}`);
    console.log("🔗 Available endpoints:");
    console.log("   GET  /health");
    console.log("   POST /api/auth/login");
    console.log("   POST /api/auth/register");
    console.log("   GET  /api/auth/users");
    console.log('🔌 Socket.io server initialized');
  });
}

export default app;

// index.js
// Main Express server setup

import cors from "cors";
import dotenv from "dotenv";
import express from "express";

import { errorHandler, notFound } from "./middleware/errorMiddleware.js";

// Routes
import alertRoutes from "./routes/alertRoutes.js";
import apiRoutes from "./routes/apiRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import forecastTriggerRoutes from "./routes/forecastTriggerRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";

dotenv.config();

const app = express(); // ✅ YOU WERE MISSING THIS

// ------------------------------
// CORS Configuration
// ------------------------------
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
];

app.use(
  cors({
    origin: allowedOrigins,
    methods: "GET,POST,PUT,DELETE,PATCH",
    allowedHeaders: "Content-Type,Authorization",
    credentials: true,
  })
);

app.options("*", cors());

// ------------------------------
// Body Parsers
// ------------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ------------------------------
// Root Endpoint
// ------------------------------
app.get("/", (req, res) => {
  res.send("API is running...");
});

// ------------------------------
// API Routes
// ------------------------------
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api", apiRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/forecast", forecastTriggerRoutes);
app.use("/api/dashboard", dashboardRoutes);


// ------------------------------
// Error Handling Middleware
// ------------------------------
app.use(notFound);
app.use(errorHandler);

// ------------------------------
// Start Server
// ------------------------------


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;

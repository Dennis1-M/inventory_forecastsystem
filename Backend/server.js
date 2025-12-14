
// server.js
// Main Express server setup
// Configures middleware, routes, and error handling

import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";

// ------------------------------
// Route Imports
// ------------------------------
import apiRoutes from "./routes/apiRoutes.js"; // products, sales, inventory, etc.
import authRoutes from "./routes/authRoutes.js"; // login, register
import userRoutes from "./routes/userRoutes.js"; // users

// ------------------------------
// Env Config
// ------------------------------
dotenv.config();
const app = express();

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

// Preflight
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

// ------------------------------
// Error Handling Middleware
// ------------------------------
app.use(notFound);
app.use(errorHandler);

export default app;

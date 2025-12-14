// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import apiRoutes from "./routes/apiRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
// Main Express server setup
// Configures middleware, routes, and error handling

dotenv.config();
const app = express();

// CORS
app.use(cors({
  origin: ["http://localhost:5173","http://localhost:5174","http://127.0.0.1:5174"],
  methods: "GET,POST,PUT,DELETE,PATCH",
  allowedHeaders: "Content-Type,Authorization",
  credentials: true,
}));
app.options("*", cors());

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root
app.get("/", (req, res) => res.send("API is running..."));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api", apiRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;

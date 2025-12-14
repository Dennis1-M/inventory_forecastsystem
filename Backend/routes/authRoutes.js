// routes/authRoutes.js

import express from "express";
import {
  loginUser,
  registerSuperAdmin,
  registerUser,
} from "../controllers/authController.js";

const router = express.Router();

// Auth routes
router.post("/login", loginUser);
router.post("/register", registerUser);
router.post("/register-superuser", registerSuperAdmin);

export default router;

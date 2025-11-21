import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js";

const router = express.Router();

// POST /api/auth/register
// Public access: Allows new users to create accounts
router.post("/register", registerUser);

// POST /api/auth/login
// Public access: Allows users to obtain a JWT token
router.post("/login", loginUser);

export default router;
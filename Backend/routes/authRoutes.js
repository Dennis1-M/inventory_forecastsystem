import express from "express";
import { loginUser, registerUser } from "../controllers/authController.js";

const router = express.Router();

// @route   POST /api/auth/register
router.post("/register", registerUser);

// @route   POST /api/auth/login
router.post("/login", loginUser);

export default router;

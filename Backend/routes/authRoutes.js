import express from "express";
import {
    registerUser,
    loginUser,
    getMe
} from "../controllers/authController.js";

// import { verifyToken } from "../middleware/authMiddleware.js";n

const router = express.Router();

// Register a new user
router.post("/register", registerUser);

// Login user
router.post("/login", loginUser);

// Get current user (protected)
router.get("/me", getMe);

export default router;

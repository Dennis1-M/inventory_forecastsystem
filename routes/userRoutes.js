import express from "express";
import { registerUser, getUsers } from "../controllers/userController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
const router = express.Router();
router.post("/register", registerUser);
router.get("/", verifyToken, getUsers);
export default router;

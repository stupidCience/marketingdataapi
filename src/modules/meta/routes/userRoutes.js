import express from "express";
import { fetchUser } from "../controllers/userController.js";
import { authenticateToken } from "../../../core/middleware/authMiddleware.js";

const router = express.Router();

router.get("/me", authenticateToken, fetchUser);

export default router;
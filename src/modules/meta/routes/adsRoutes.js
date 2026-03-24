import express from "express";
import { fetchAdAccounts } from "../controllers/adsController.js";
import { authenticateToken } from "../../../core/middleware/authMiddleware.js";

const router = express.Router();

router.get("/ad-accounts", authenticateToken, fetchAdAccounts);

export default router;
// src/modules/meta/routes/adsRoutes.js
import express from "express";
import { fetchAdAccounts,
        fetchAvailableAccounts,
        saveSelectedAccounts,
        fetchSavedAccounts,
        triggerMetricsSync,
        fetchMetricsData } from "../controllers/adsController.js";
import { authenticateToken } from "../../../core/middleware/authMiddleware.js";

const router = express.Router();

router.get("/ad-accounts", authenticateToken, fetchAdAccounts);
router.get("/ad-accounts/available", authenticateToken, fetchAvailableAccounts);
router.post("/ad-accounts/select", authenticateToken, saveSelectedAccounts);
router.get("/ad-accounts/saved", authenticateToken, fetchSavedAccounts);
router.post("/sync-metrics", authenticateToken, triggerMetricsSync);
router.get("/metrics", authenticateToken, fetchMetricsData);
export default router;
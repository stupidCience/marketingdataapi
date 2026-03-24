import express from "express";
import { handleMetaCallback, redirectToMetaLogin, checkAuthStatus } from "../controllers/auth.controller.js";

const router = express.Router();

router.get("/auth/status", checkAuthStatus);
router.get("/auth/login", redirectToMetaLogin);
router.get("/auth/callback", handleMetaCallback);

export default router;
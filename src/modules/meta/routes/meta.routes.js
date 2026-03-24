import express from "express";
import { handleMetaCallback, redirectToMetaLogin, checkAuthStatus } from "../controllers/auth.controller.js";

const router = express.Router();

router.get("/status", checkAuthStatus);
router.get("/login", redirectToMetaLogin);
router.get("/callback", handleMetaCallback);

export default router;
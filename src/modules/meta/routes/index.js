// src/modules/meta/routes/index.js
import { Router } from "express";
import metaRoutes from "./meta.routes.js"; // Provavelmente suas rotas de auth/callback
import adsRoutes from "./adsRoutes.js";
import userRoutes from "./userRoutes.js";

const router = Router();

// Todas essas rotas vão herdar o prefixo "/api/meta" que colocaremos no app.js
router.use("/auth", metaRoutes); // As rotas de meta.routes virarão: /api/meta/auth/...
router.use("/ads", adsRoutes);   // As rotas de ads virarão: /api/meta/ads/...
router.use("/user", userRoutes); // As rotas de user virarão: /api/meta/user/...

export default router;
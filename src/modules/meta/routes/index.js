// src/modules/meta/routes/index.js
import { Router } from "express";
import metaRoutes from "./meta.routes.js"; 
import adsRoutes from "./adsRoutes.js";
import userRoutes from "./userRoutes.js";

const router = Router();

// Agrupa todas as rotas sem adicionar prefixos extra aqui
router.use("/", metaRoutes); 
router.use("/", adsRoutes);  
router.use("/", userRoutes); 

export default router;
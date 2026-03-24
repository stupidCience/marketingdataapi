// src/app.js
import express from "express";
import cors from "cors";
import metaModuleRoutes from "./modules/meta/routes/index.js"; 
import * as authController from './modules/auth/auth.controller.js';
import { successResponse, errorResponse } from "./core/utils/response.util.js";

const app = express();

// --- MIDDLEWARES GLOBAIS ---
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true 
}));
app.use(express.json());

// --- HEALTH CHECK ---
app.get("/", (req, res) => { 
  return successResponse(res, null, "API MarketingData rodando 🚀", 200); 
});

// --- ROTAS DA API ---
// Importante: Definir rotas ANTES do middleware de erro 404
app.post('/api/auth/login', authController.login);
app.use("/api/meta", metaModuleRoutes);

// --- TRATAMENTO DE ERROS ---
app.use((req, res, next) => {
  return errorResponse(res, "A rota solicitada não foi encontrada na API.", 404);
});

app.use((err, req, res, next) => {
  console.error("🔥 [Erro Global]:", err.message);
  return errorResponse(res, err.message || "Ocorreu um erro interno no servidor.", err.status || 500);
});

export default app;
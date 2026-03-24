// src/app.js
import express from "express";
import cors from "cors";
import metaModuleRoutes from "./modules/meta/routes/index.js"; 
import { successResponse, errorResponse } from "./core/utils/response.util.js"; // <-- NOVO IMPORT

const app = express();

// --- MIDDLEWARES GLOBAIS ---
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true 
}));
app.use(express.json());

// --- HEALTH CHECK ---
app.get("/", (req, res) => { 
  // <-- USANDO O PADRÃO DE SUCESSO
  return successResponse(res, null, "API rodando 🚀", 200); 
});

// --- ROTAS DA API ---
app.use("/api/meta", metaModuleRoutes);

// --- TRATAMENTO DE ERROS ---
app.use((req, res, next) => {
  // <-- USANDO O PADRÃO DE ERRO PARA 404
  return errorResponse(res, "A rota solicitada não foi encontrada na API.", 404);
});

app.use((err, req, res, next) => {
  console.error("🔥 [Erro Global]:", err.message);
  // <-- USANDO O PADRÃO DE ERRO GLOBAL (500)
  return errorResponse(res, err.message || "Ocorreu um erro interno no servidor.", err.status || 500);
});

export default app;
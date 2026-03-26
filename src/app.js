// src/app.js
import express from "express";
import cors from "cors";

// Rotas
import metaModuleRoutes from "./modules/meta/routes/index.js"; 
import * as authController from './modules/auth/auth.controller.js';

// Utilitários
import responseUtil from "./core/utils/response.util.js";

const app = express();

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true 
}));
app.use(express.json());

app.get("/", (req, res) => { 
  return responseUtil.success(res, null, "API MarketingData rodando 🚀", 200); 
});

app.post('/api/auth/login', authController.login);
app.use('/api/meta', metaModuleRoutes);

// Tratamento de 404
app.use((req, res, next) => {
  console.log(`❌ ALERTA: Tentativa de acesso a rota inexistente: ${req.originalUrl}`);
  return responseUtil.error(res, `A rota solicitada (${req.originalUrl}) não foi encontrada.`, 404);
});

app.use((err, req, res, next) => {
  console.error("🔥 [Erro Global]:", err.message);
  return responseUtil.error(res, err.message, err.status || 500);
});

export default app;
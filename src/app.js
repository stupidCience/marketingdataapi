// src/app.js
import express from "express";
import cors from "cors";

// Importa apenas o roteador central do módulo Meta
import metaModuleRoutes from "./modules/meta/routes/index.js"; 

const app = express();

// --- MIDDLEWARES GLOBAIS ---
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true 
}));
app.use(express.json());

// --- HEALTH CHECK ---
app.get("/", (req, res) => { 
  res.status(200).json({ status: "OK", message: "API rodando 🚀" }); 
});

// --- ROTAS DA API ---
// Aqui está a mágica! Qualquer rota dentro desse módulo terá o prefixo /api/meta
app.use("/api/meta", metaModuleRoutes);

// No futuro, você fará apenas isso para novos serviços:
// import googleRoutes from './modules/google/routes/index.js';
// app.use("/api/google", googleRoutes);

// --- TRATAMENTO DE ERROS ---
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: "Rota não encontrada na API." });
});

app.use((err, req, res, next) => {
  console.error("🔥 [Erro Global]:", err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Ocorreu um erro interno no servidor.",
  });
});

export default app;
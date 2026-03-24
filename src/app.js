import express from "express";
import metaRoutes from "./modules/meta/routes/meta.routes.js";
import adsRoutes from "./modules/meta/routes/adsRoutes.js";
import userRoutes from "./modules/meta/routes/userRoutes.js";

const app = express();

// Middleware deve vir ANTES das rotas
app.use(express.json());

app.get("/", (req, res) => { res.send("API rodando 🚀"); });

// Rotas
app.use("/", metaRoutes);
app.use("/ads", adsRoutes);
app.use("/user", userRoutes);
export default app;
// src/modules/meta/routes/meta.routes.js
import express from 'express';
import { handleMetaCallback, getMetaStatus } from '../controllers/auth.controller.js'; // 👈 Importamos o getMetaStatus
import { authenticateToken } from '../../../core/middleware/authMiddleware.js';

const router = express.Router();

router.post('/auth/callback', authenticateToken, handleMetaCallback);

// 👇 NOVA ROTA AQUI 👇
router.get('/status', authenticateToken, getMetaStatus);

export default router;
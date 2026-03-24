// src/core/middleware/authMiddleware.js
import { errorResponse } from "../utils/response.util.js";
import { getCurrentValidToken, validateToken } from "../../modules/meta/services/auth.service.js"; 

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    let accessToken = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      accessToken = authHeader.substring(7);
    }

    if (!accessToken) {
      // Busca a integração padrão (no futuro, isto será substituído por um JWT real do seu front-end)
      accessToken = await getCurrentValidToken();
    }

    if (!accessToken) {
      return errorResponse(res, "Acesso negado. Token de autenticação não fornecido.", 401);
    }

    const isValid = await validateToken(accessToken);
    
    if (!isValid) {
      return errorResponse(res, "Sessão expirada ou token inválido. Por favor, inicie sessão novamente.", 401);
    }

    // --- 🚀 A MÁGICA DO MULTI-TENANT ACONTECE AQUI ---
    // Numa app final, você leria um token JWT aqui e extrairia estes dados.
    // Como estamos na fundação, vamos injetar o utilizador e a empresa que criámos no data.json!
    req.user = { 
      id: 1,                  // ID do João
      clientId: 1,            // O ID da Agência/Empresa a que o João pertence!
      role: "admin",          // Nível de acesso
      token: accessToken      // O token da Meta para fazer as chamadas
    };
    
    next();
  } catch (error) {
    console.error("🔥 [Auth Middleware Error]:", error.message);
    const statusCode = error.statusCode || 401;
    return errorResponse(res, error.message || "Erro na validação da autenticação.", statusCode);
  }
};
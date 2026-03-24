import jwt from 'jsonwebtoken';
import { errorResponse } from "../utils/response.util.js";

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Pega o "TOKEN" do "Bearer TOKEN"

    if (!token) {
      return errorResponse(res, "Acesso negado. Token não fornecido.", 401);
    }

    // Verifica e decodifica o Token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return errorResponse(res, "Token inválido ou expirado.", 403);
      }

      // Injeta os dados REAIS do usuário no pedido
      req.user = {
        id: decoded.id,
        clientId: decoded.clientId,
        role: decoded.role,
        token: token // Opcional: manter o JWT original
      };

      next();
    });
  } catch (error) {
    return errorResponse(res, "Erro na autenticação", 401);
  }
};
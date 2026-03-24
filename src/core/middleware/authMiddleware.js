import { getCurrentValidToken, validateToken } from "../../modules/meta/services/auth.service.js";

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    let accessToken = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      accessToken = authHeader.substring(7);
      console.log('ℹ️  Token encontrado no header Authorization');
    } else {
      console.log('ℹ️  Nenhum token no header, tentando buscar do armazenamento...');
    }

    // Se não há token no header, tenta obter token válido do banco
    if (!accessToken) {
      accessToken = await getCurrentValidToken();

      if (!accessToken) {
        return res.status(401).json({
          error: "Autenticação necessária",
          message: "Nenhuma integração válida encontrada. Faça login em /auth/login primeiro.",
          action: {
            url: "/auth/login",
            method: "GET",
            description: "Iniciar fluxo de autenticação OAuth com Meta"
          }
        });
      }
    }

    if (!accessToken) {
      return res.status(401).json({
        error: "Token de acesso obrigatório",
        message: "Envie o token via header Authorization: Bearer <token> ou faça login primeiro"
      });
    }

    // Valida o token fazendo uma chamada de teste para a API do Meta
    const userData = await validateToken(accessToken);

    if (!userData) {
      return res.status(401).json({
        error: "Token de acesso inválido ou expirado",
        message: "O token fornecido não é válido. Faça login novamente em /auth/login",
        action: {
          url: "/auth/login",
          method: "GET",
          description: "Renovar autenticação com Meta"
        }
      });
    }

    // Token válido - continua
    req.accessToken = accessToken;
    req.userData = userData;
    next();

  } catch (error) {
    console.error('Erro no middleware de autenticação:', error);
    res.status(500).json({
      error: "Erro interno do servidor",
      message: "Erro ao validar autenticação"
    });
  }
};
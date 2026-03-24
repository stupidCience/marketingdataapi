import axios from "axios";
import { successResponse, errorResponse } from "../../../core/utils/response.util.js";
import {
  exchangeCodeForToken,
  exchangeForLongLivedToken,
  getCurrentValidToken,
  validateToken
} from "../services/auth.service.js";
import { upsertMetaIntegration } from "../repositories/metaAccount.repository.js";

export const checkAuthStatus = async (req, res) => {
  try {
    const token = await getCurrentValidToken();

    if (!token) {
      // Devolvemos um JSON de sucesso (200), mas avisando que a autenticação é false
      return successResponse(res, {
        authenticated: false,
        action: { url: "/api/meta/auth/login", method: "GET", description: "Iniciar fluxo de autenticação" }
      }, "Nenhuma integração válida encontrada");
    }

    const userData = await validateToken(token);

    if (!userData) {
      return successResponse(res, {
        authenticated: false,
        action: { url: "/api/meta/auth/login", method: "GET", description: "Renovar autenticação" }
      }, "Token expirado ou inválido");
    }

    return successResponse(res, { authenticated: true, user: userData }, "Usuário autenticado com Meta");

  } catch (error) {
    console.error('🔥 Erro ao verificar status de autenticação:', error.message);
    return errorResponse(res, "Erro interno ao verificar autenticação", 500);
  }
};

export const handleMetaCallback = async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return errorResponse(res, "Parâmetro 'code' obrigatório na URL de callback", 400);
    }

    const shortToken = await exchangeCodeForToken(code);
    const longToken = await exchangeForLongLivedToken(shortToken.access_token);
    const accessToken = longToken.access_token;

    // Observação: O ideal na Etapa 5 será mover esta chamada do Axios para o auth.service.js
    const { data: metaUser } = await axios.get("https://graph.facebook.com/me", {
      params: { access_token: accessToken, fields: "id,name" },
    });

    const expiresAt = new Date(Date.now() + longToken.expires_in * 1000);

    const user = await upsertMetaIntegration({
      metaUserId: metaUser.id,
      name: metaUser.name,
      accessToken,
      expiresAt,
    });

    return successResponse(res, user, "Meta conectado com sucesso 🚀");
  } catch (error) {
    const statusCode = error.response?.status || 500;
    const errorMessage = error.response?.data?.error_description || error.message || "Erro desconhecido na autenticação Meta";
    
    console.error(`🔥 [Auth Error]:`, errorMessage);
    return errorResponse(res, errorMessage, statusCode);
  }
};

export const redirectToMetaLogin = (req, res) => {
  // Redirecionamentos (302) não retornam JSON, logo, mantemos a função nativa do Express
  const authUrl = `https://www.facebook.com/v25.0/dialog/oauth?client_id=${process.env.META_APP_ID}&redirect_uri=${encodeURIComponent(process.env.META_REDIRECT_URI)}&scope=read_insights,pages_show_list,pages_manage_ads`;
  res.redirect(authUrl);
};
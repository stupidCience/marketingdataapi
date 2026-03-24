import axios from "axios";
import { getValidIntegration } from "../repositories/metaAccount.repository.js";

// Função auxiliar para padronizar os erros da Meta
const handleMetaError = (error, context) => {
  const metaMessage = error.response?.data?.error?.message || error.message;
  const customError = new Error(`${context}: ${metaMessage}`);
  customError.statusCode = error.response?.status || 500;
  throw customError;
};

export const exchangeCodeForToken = async (code) => {
  if (!code || typeof code !== 'string') {
    const err = new Error('Código de autorização inválido ou ausente');
    err.statusCode = 400;
    throw err;
  }

  try {
    const { data } = await axios.get("https://graph.facebook.com/v25.0/oauth/access_token", {
      params: {
        client_id: process.env.META_APP_ID,
        client_secret: process.env.META_APP_SECRET,
        redirect_uri: process.env.META_REDIRECT_URI,
        code,
      },
    });
    return data;
  } catch (error) {
    handleMetaError(error, "Erro ao trocar código por token");
  }
};

export const exchangeForLongLivedToken = async (token) => {
  if (!token || typeof token !== 'string') {
    const err = new Error('Token inválido ou ausente');
    err.statusCode = 400;
    throw err;
  }

  try {
    const { data } = await axios.get("https://graph.facebook.com/v25.0/oauth/access_token", {
      params: {
        grant_type: "fb_exchange_token",
        client_id: process.env.META_APP_ID,
        client_secret: process.env.META_APP_SECRET,
        fb_exchange_token: token,
      },
    });
    return data;
  } catch (error) {
    handleMetaError(error, "Erro ao gerar Long-Lived Token");
  }
};

// 🚀 Agora recebe o clientId (Padrão: 1) para buscar a integração da Agência correta!
export const getCurrentValidToken = async (clientId = 1) => {
  try {
    const integration = await getValidIntegration(clientId);
    if (integration) {
      return integration.access_token;
    }
    return null;
  } catch (error) {
    console.error('Erro ao buscar token válido no repositório:', error.message);
    return null;
  }
};

export const validateToken = async (accessToken) => {
  try {
    const response = await axios.get('https://graph.facebook.com/me', {
      params: { access_token: accessToken, fields: 'id' }
    });
    return response.data;
  } catch (error) {
    // Se o token for inválido, não atiramos erro, apenas devolvemos null para o middleware bloquear
    console.error('❌ Token inválido ou expirado:', error.response?.data?.error?.message || error.message);
    return null;
  }
};
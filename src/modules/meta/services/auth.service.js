import axios from "axios";
import { getValidIntegration } from "../repositories/metaAccount.repository.js";

export const exchangeCodeForToken = async (code) => {
  if (!code || typeof code !== 'string') {
    throw new Error('Código de autorização inválido ou ausente');
  }

  try {
    const { data } = await axios.get(
      "https://graph.facebook.com/v25.0/oauth/access_token",
      {
        params: {
          client_id: process.env.META_APP_ID,
          client_secret: process.env.META_APP_SECRET,
          redirect_uri: process.env.META_REDIRECT_URI,
          code,
        },
      }
    );
    return data;
  } catch (error) {
    console.error('Erro ao trocar código por token:', error.response?.data || error.message);
    throw error;
  }
};

export const exchangeForLongLivedToken = async (token) => {
  if (!token || typeof token !== 'string') {
    throw new Error('Token inválido ou ausente');
  }

  try {
    const { data } = await axios.get(
      "https://graph.facebook.com/v25.0/oauth/access_token",
      {
        params: {
          grant_type: "fb_exchange_token",
          client_id: process.env.META_APP_ID,
          client_secret: process.env.META_APP_SECRET,
          fb_exchange_token: token,
        },
      }
    );
    return data;
  } catch (error) {
    console.error('Erro ao trocar por long-lived token:', error.response?.data || error.message);
    throw error;
  }
};

export const getCurrentValidToken = async () => {
  try {
    const integration = await getValidIntegration();
    if (integration) {
      console.log(`✅ Token válido encontrado para usuário: ${integration.name}`);
      return integration.access_token;
    }
    console.warn(`⚠️  Nenhuma integração válida encontrada (expiradas ou não existem)`);
    return null;
  } catch (error) {
    console.error('Erro ao buscar token válido:', error.message);
    return null;
  }
};

export const validateToken = async (accessToken) => {
  try {
    const response = await axios.get('https://graph.facebook.com/me', {
      params: {
        access_token: accessToken,
        fields: 'id'
      }
    });
    console.log(`✅ Token validado com sucesso para usuário Meta: ${response.data.id}`);
    return response.data;
  } catch (error) {
    console.error('❌ Token inválido:', error.response?.data?.error?.message || error.message);
    return null;
  }
};
// src/modules/meta/controllers/auth.controller.js
import axios from 'axios';
import { upsertMetaIntegration, getValidIntegration } from '../repositories/metaAccount.repository.js'; // 👈 Adicionamos o getValidIntegration aqui
import responseUtil from '../../../core/utils/response.util.js';

export const handleMetaCallback = async (req, res) => {
  const { code, redirectUri } = req.body;
  const clientId = req.clientId; 

  if (!code || !redirectUri) {
    return responseUtil.error(res, 'Parâmetros code e redirectUri são obrigatórios', 400);
  }

  try {
    const tokenResponse = await axios.get('https://graph.facebook.com/v19.0/oauth/access_token', {
      params: {
        client_id: process.env.META_APP_ID,
        client_secret: process.env.META_APP_SECRET, 
        redirect_uri: redirectUri,
        code: code,
      },
    });

    const accessToken = tokenResponse.data.access_token;
    const expiresIn = tokenResponse.data.expires_in; 
    let expiresAt = null;
    if (expiresIn) {
      expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();
    }

    const meResponse = await axios.get('https://graph.facebook.com/me', {
      params: {
        access_token: accessToken,
        fields: 'id,name', 
      },
    });

    const metaUserId = meResponse.data.id;
    const metaUserName = meResponse.data.name; 

    const integration = await upsertMetaIntegration({
      metaUserId,
      name: metaUserName,
      accessToken,
      expiresAt,
      clientId, 
    });

    return responseUtil.success(res, integration, 'Integração com a Meta realizada com sucesso!');
  } catch (error) {
    console.error('Erro na integração Meta:', error.response?.data || error.message);
    const errorMessage = error.response?.data?.error?.message || 'Falha ao validar a autorização com o Facebook.';
    return responseUtil.error(res, errorMessage, 500);
  }
};

// 👇 NOVA FUNÇÃO AQUI 👇
export const getMetaStatus = async (req, res) => {
  try {
    const clientId = req.clientId;
    
    // Vai no SQLite procurar se esse cliente tem uma integração da Meta válida
    const integration = await getValidIntegration(clientId);

    if (integration) {
      return responseUtil.success(res, { isConnected: true }, 'Meta já conectada.');
    }

    return responseUtil.success(res, { isConnected: false }, 'Meta não conectada.');
  } catch (error) {
    console.error('Erro ao buscar status da Meta:', error.message);
    return responseUtil.error(res, 'Erro ao buscar status da integração', 500);
  }
};
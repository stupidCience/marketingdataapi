import axios from "axios";
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
      return res.json({
        authenticated: false,
        message: "Nenhuma integração válida encontrada",
        action: {
          url: "/auth/login",
          method: "GET",
          description: "Iniciar fluxo de autenticação OAuth com Meta"
        }
      });
    }

    // Valida se o token ainda funciona
    const userData = await validateToken(token);

    if (!userData) {
      return res.json({
        authenticated: false,
        message: "Token expirado ou inválido",
        action: {
          url: "/auth/login",
          method: "GET",
          description: "Renovar autenticação com Meta"
        }
      });
    }

    res.json({
      authenticated: true,
      user: userData,
      message: "Usuário autenticado com Meta"
    });

  } catch (error) {
    console.error('Erro ao verificar status de autenticação:', error);
    res.status(500).json({
      authenticated: false,
      error: "Erro interno ao verificar autenticação"
    });
  }
};

export const handleMetaCallback = async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({ error: "Parâmetro 'code' obrigatório na URL de callback" });
    }

    const shortToken = await exchangeCodeForToken(code);
    const longToken = await exchangeForLongLivedToken(
      shortToken.access_token
    );

    const accessToken = longToken.access_token;

    const { data: metaUser } = await axios.get(
      "https://graph.facebook.com/me",
      {
        params: {
          access_token: accessToken,
          fields: "id,name",
        },
      }
    );

    const expiresAt = new Date(Date.now() + longToken.expires_in * 1000);

    const user = await upsertMetaIntegration({
      metaUserId: metaUser.id,
      name: metaUser.name,
      accessToken,
      expiresAt,
    });

    res.json({
      message: "Meta conectado com sucesso 🚀",
      user,
    });
  } catch (error) {
    const statusCode = error.response?.status || 500;
    const errorMessage = error.response?.data?.error_description || error.message || "Erro desconhecido na autenticação Meta";
    
    console.error(`[Auth Error - ${statusCode}]:`, errorMessage);
    
    res.status(statusCode === 400 ? 400 : 500).json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const redirectToMetaLogin = (req, res) => {
  const authUrl = `https://www.facebook.com/v25.0/dialog/oauth?client_id=${process.env.META_APP_ID}&redirect_uri=${encodeURIComponent(process.env.META_REDIRECT_URI)}&scope=read_insights,pages_show_list,pages_manage_ads`;

  res.redirect(authUrl);
};
// src/modules/meta/repositories/metaAccount.repository.js
import { query, insertIntegration, updateIntegration } from "../../../core/config/database.js";

export const upsertMetaIntegration = async ({
  metaUserId,
  name, // Nome da página/conta da Meta, apenas para referência
  accessToken,
  expiresAt,
  clientId = 1 // TODO (Etapa 5): Receber isto do Service (que recebe do req.user)
}) => {
  if (!metaUserId || !accessToken) {
    throw new Error("Parâmetros obrigatórios faltando: metaUserId, accessToken");
  }

  if (expiresAt && isNaN(new Date(expiresAt).getTime())) {
    throw new Error("expiresAt deve ser um Date válido ou string válida");
  }

  // Verifica se esta página da Meta já está integrada no sistema
  const findIntegration = query(
    `SELECT id AS integration_id, client_id FROM integrations WHERE provider = ? AND meta_user_id = ? LIMIT 1`,
    ["meta", metaUserId]
  );

  // Se já existe, apenas renova o Token de Acesso
  if (findIntegration.rows.length > 0) {
    const { integration_id } = findIntegration.rows[0];
    
    updateIntegration(integration_id, accessToken, expiresAt);
    
    const updatedIntegration = query(`SELECT * FROM integrations WHERE id = ?`, [integration_id]);
    return updatedIntegration.rows[0];
  }

  // Se não existe, cria uma nova integração associada à Empresa (Client)
  const newIntegration = insertIntegration(clientId, "meta", metaUserId, accessToken, expiresAt);
  return newIntegration;
};

export const getValidIntegration = async (clientId = 1) => {
  const now = new Date().toISOString();

  // Busca a integração ativa DESTA empresa específica
  const validIntegrations = query(
    `SELECT * FROM integrations WHERE client_id = ? AND expires_at > ? ORDER BY updated_at DESC LIMIT 1`,
    [clientId, now]
  );

  if (validIntegrations.rows.length > 0) {
    return validIntegrations.rows[0];
  }

  return null;
};
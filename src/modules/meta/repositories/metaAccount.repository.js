import { query, insertUser, insertIntegration, updateUser, updateIntegration } from "../../../core/config/database.js";

export const upsertMetaIntegration = async ({
  metaUserId,
  name,
  accessToken,
  expiresAt,
}) => {
  if (!metaUserId || !name || !accessToken) {
    throw new Error("Parâmetros obrigatórios faltando: metaUserId, name, accessToken");
  }

  if (expiresAt && isNaN(new Date(expiresAt).getTime())) {
    throw new Error("expiresAt deve ser um Date válido ou string válida");
  }

  const findIntegration = query(
    `SELECT u.id AS user_id, u.name, u.email, i.id AS integration_id FROM users u JOIN integrations i ON i.user_id = u.id WHERE i.provider = ? AND i.meta_user_id = ? LIMIT 1`,
    ["meta", metaUserId]
  );

  if (findIntegration.rows.length > 0) {
    const { user_id, integration_id } = findIntegration.rows[0];

    updateUser(user_id, name);
    updateIntegration(integration_id, accessToken, expiresAt);

    const updatedIntegration = query(`SELECT * FROM integrations WHERE id = ?`, [integration_id]);

    return {
      id: user_id,
      name,
      integration: updatedIntegration.rows[0],
    };
  }

  const userEmail = `user_${metaUserId}@meta.local`;

  const newUser = insertUser(name, userEmail);
  const newIntegration = insertIntegration(newUser.id, "meta", metaUserId, accessToken, expiresAt);

  return {
    ...newUser,
    integration: newIntegration,
  };
};

export const getValidIntegration = async () => {
  const now = new Date().toISOString();

  // Buscar integrações que não expiraram
  const validIntegrations = query(
    `SELECT i.*, u.name, u.email
      FROM integrations i
      JOIN users u ON u.id = i.user_id
      WHERE i.expires_at > ?
      ORDER BY i.updated_at DESC
      LIMIT 1`,
    [now]
  );

  if (validIntegrations.rows.length > 0) {
    return validIntegrations.rows[0];
  }

  return null;
};
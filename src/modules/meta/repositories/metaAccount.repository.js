import { query, insertIntegration, updateIntegration } from "../../../core/config/database.js";

const upsertMetaIntegration = async ({
  metaUserId,
  name,
  accessToken,
  expiresAt,
  clientId = 1
}) => {
  const findIntegration = query(
    `SELECT id AS integration_id, client_id FROM integrations WHERE provider = ? AND meta_user_id = ? LIMIT 1`,
    ["meta", metaUserId]
  );

  if (findIntegration.rows.length > 0) {
    const { integration_id } = findIntegration.rows[0];
    updateIntegration(integration_id, accessToken, expiresAt);
    const updatedIntegration = query(`SELECT * FROM integrations WHERE id = ?`, [integration_id]);
    return updatedIntegration.rows[0];
  }

  return insertIntegration(clientId, "meta", metaUserId, accessToken, expiresAt);
};

const findByClientId = async (clientId) => {
  const result = query(
    `SELECT * FROM integrations WHERE client_id = ? AND provider = ?`,
    [clientId, "meta"]
  );
  return result.rows;
};

const getValidIntegration = async (clientId = 1) => {
  const now = new Date().toISOString();
  const validIntegrations = query(
    `SELECT * FROM integrations WHERE client_id = ? AND expires_at > ? ORDER BY updated_at DESC LIMIT 1`,
    [clientId, now]
  );

  return validIntegrations.rows.length > 0 ? validIntegrations.rows[0] : null;
};

// ✅ Exportação híbrida (Resolve erro no AdsService e no Auth.service)
export { upsertMetaIntegration, findByClientId, getValidIntegration };

export default {
  upsertMetaIntegration,
  findByClientId,
  getValidIntegration
};
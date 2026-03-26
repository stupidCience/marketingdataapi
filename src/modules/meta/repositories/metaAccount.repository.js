// src/modules/meta/repositories/metaAccount.repository.js
import { query, insertIntegration, updateIntegration } from "../../../core/config/database.js";

const upsertMetaIntegration = async ({ metaUserId, name, accessToken, expiresAt, clientId = 1 }) => {
  const findIntegration = await query(
    `SELECT id AS integration_id, client_id FROM integrations WHERE provider = ? AND external_account_id = ? LIMIT 1`,
    ["meta", metaUserId]
  );

  if (findIntegration.rows.length > 0) {
    const { integration_id } = findIntegration.rows[0];
    await updateIntegration(integration_id, accessToken, expiresAt); 
    const updatedIntegration = await query(`SELECT * FROM integrations WHERE id = ?`, [integration_id]);
    return updatedIntegration.rows[0];
  }

  const metadata = { account_name: name };
  return await insertIntegration(clientId, "meta", metaUserId, accessToken, expiresAt, null, metadata);
};

const findByClientId = async (clientId) => {
  const result = await query(
    `SELECT * FROM integrations WHERE client_id = ? AND provider = ?`,
    [clientId, "meta"]
  );
  return result.rows;
};

const getValidIntegration = async (clientId = 1) => {
  const now = new Date().toISOString();
  const validIntegrations = await query(
    `SELECT * FROM integrations WHERE client_id = ? AND provider = ? AND expires_at > ? ORDER BY updated_at DESC LIMIT 1`,
    [clientId, "meta", now]
  );
  return validIntegrations.rows.length > 0 ? validIntegrations.rows[0] : null;
};

// 👇 NOVA FUNÇÃO AQUI 👇
const saveSelectedAdAccounts = async (clientId, integrationId, provider, accounts) => {
  // 1. Desativa todas as contas deste provedor para este cliente (reset)
  await query(
    `UPDATE ad_accounts SET is_active = 0 WHERE client_id = ? AND provider = ?`,
    [clientId, provider]
  );

  // 2. Insere ou reativa as contas que vieram no array
  for (const acc of accounts) {
    const existing = await query(
      `SELECT id FROM ad_accounts WHERE client_id = ? AND provider = ? AND external_account_id = ?`,
      [clientId, provider, acc.account_id] // A API do Facebook devolve 'account_id'
    );

    if (existing.rows.length > 0) {
      // Já existe, apenas atualiza os dados e reativa
      await query(
        `UPDATE ad_accounts SET is_active = 1, name = ?, currency = ? WHERE id = ?`,
        [acc.name, acc.currency, existing.rows[0].id]
      );
    } else {
      // É uma conta nova, vamos inserir
      await query(
        `INSERT INTO ad_accounts (client_id, integration_id, provider, external_account_id, name, currency, is_active)
         VALUES (?, ?, ?, ?, ?, ?, 1)`,
        [clientId, integrationId, provider, acc.account_id, acc.name, acc.currency]
      );
    }
  }
};

const getSavedAdAccounts = async (clientId, provider) => {
  const result = await query(
    `SELECT * FROM ad_accounts WHERE client_id = ? AND provider = ? AND is_active = 1`,
    [clientId, provider]
  );
  return result.rows;
};

const upsertCampaignMetrics = async (clientId, provider, accountId, metrics) => {
  for (const row of metrics) {
    // O ON CONFLICT usa a chave UNIQUE que criamos para evitar dados duplicados
    await query(
      `INSERT INTO campaign_metrics 
      (client_id, provider, account_id, campaign_id, campaign_name, date, currency, spend, impressions, clicks)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(client_id, provider, account_id, campaign_id, date) 
      DO UPDATE SET 
        campaign_name = excluded.campaign_name,
        currency = excluded.currency,
        spend = excluded.spend,
        impressions = excluded.impressions,
        clicks = excluded.clicks,
        updated_at = CURRENT_TIMESTAMP`,
      [
        clientId,
        provider,
        accountId,
        row.campaign_id,
        row.campaign_name,
        row.date_start, 
        row.currency, 
        row.spend,
        row.impressions,
        row.clicks
      ]
    );
  }
};

const getCampaignMetrics = async (clientId, provider) => {
  const result = await query(
    `SELECT * FROM campaign_metrics 
     WHERE client_id = ? AND provider = ? 
     ORDER BY date DESC, spend DESC 
     LIMIT 500`,
    [clientId, provider]
  );
  return result.rows;
};

export { 
  upsertMetaIntegration,
  findByClientId,
  getValidIntegration,
  saveSelectedAdAccounts,
  getSavedAdAccounts,
  upsertCampaignMetrics,
  getCampaignMetrics
 };

export default {
  upsertMetaIntegration,
  findByClientId,
  getValidIntegration,
  saveSelectedAdAccounts,
  getSavedAdAccounts,
  upsertCampaignMetrics,
  getCampaignMetrics
};
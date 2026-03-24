// src/core/config/database.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, "../../../db/data.json");

if (!fs.existsSync(path.dirname(dbPath))) {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
}

if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, JSON.stringify({ clients: [], users: [], integrations: [] }, null, 2));
}

let data = JSON.parse(fs.readFileSync(dbPath, "utf8"));

const saveData = () => {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

export const query = async (text, params = []) => {
  const start = Date.now();
  let result = [];

  // Mapeamento de queries simuladas (O "motor" do nosso banco JSON)
  if (text.includes("SELECT * FROM users WHERE email = ?")) {
    const [email] = params;
    result = data.users.filter(u => u.email === email);
  } 
  else if (text.includes("SELECT id AS integration_id, client_id FROM integrations WHERE provider = ? AND meta_user_id = ?")) {
    const [provider, metaUserId] = params;
    const integration = data.integrations.find(i => i.provider === provider && i.meta_user_id === metaUserId);
    if (integration) {
      result = [{ integration_id: integration.id, client_id: integration.client_id }];
    }
  } 
  else if (text.includes("SELECT * FROM integrations WHERE client_id = ? AND expires_at > ?")) {
    const [clientId, expiresAtComparison] = params;
    const validIntegrations = data.integrations
      .filter(i => i.client_id === clientId && i.expires_at > expiresAtComparison)
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
      .slice(0, 1);
    result = validIntegrations;
  } 
  else if (text.includes("SELECT * FROM integrations WHERE id = ?")) {
    const [id] = params;
    result = data.integrations.filter(i => i.id === id);
  } 
  else if (text.includes("SELECT * FROM users WHERE id = ?")) {
    const [id] = params;
    result = data.users.filter(u => u.id === id);
  }

  const duration = Date.now() - start;
  console.log("📊 Query executada:", { text: text.substring(0, 50) + "...", rows: result.length, duration: `${duration}ms` });

  // Retorno padrão simulando bibliotecas de SQL (como 'pg')
  return { rows: result, rowCount: result.length };
};

export const insertIntegration = (clientId, provider, metaUserId, accessToken, expiresAt) => {
  const id = data.integrations.length > 0 ? Math.max(...data.integrations.map(i => i.id)) + 1 : 1;
  const integration = {
    id,
    client_id: clientId,
    provider,
    meta_user_id: metaUserId,
    access_token: accessToken,
    expires_at: expiresAt,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  data.integrations.push(integration);
  saveData();
  return integration;
};

export const updateIntegration = (id, accessToken, expiresAt) => {
  const integration = data.integrations.find(i => i.id === id);
  if (integration) {
    integration.access_token = accessToken;
    integration.expires_at = expiresAt;
    integration.updated_at = new Date().toISOString();
    saveData();
  }
};

export const updateUser = (id, name) => {
  const user = data.users.find(u => u.id === id);
  if (user) {
    user.name = name;
    user.updated_at = new Date().toISOString();
    saveData();
  }
};

const connectDatabase = async () => {
  try {
    data = JSON.parse(fs.readFileSync(dbPath, "utf8"));
    console.log("✅ Conectado ao armazenamento JSON (Multi-Tenant)");
  } catch (error) {
    console.error("❌ Erro ao conectar ao armazenamento JSON:", error.message);
    process.exit(1);
  }
};

export default connectDatabase;
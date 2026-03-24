import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, "../../../db/data.json");

// Ensure db directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Initialize data file if it doesn't exist
if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, JSON.stringify({ users: [], integrations: [] }, null, 2));
}

let data = JSON.parse(fs.readFileSync(dbPath, "utf8"));

const saveData = () => {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

export const query = (text, params = []) => {
  const start = Date.now();

  // Simple simulation of SQL queries using the data object
  let result = [];

  if (text.includes("SELECT u.id AS user_id, u.name, u.email, i.id AS integration_id FROM users u JOIN integrations i ON i.user_id = u.id WHERE i.provider = ? AND i.meta_user_id = ? LIMIT 1")) {
    const [provider, metaUserId] = params;
    const integration = data.integrations.find(i => i.provider === provider && i.meta_user_id === metaUserId);
    if (integration) {
      const user = data.users.find(u => u.id === integration.user_id);
      if (user) {
        result = [{ user_id: user.id, name: user.name, email: user.email, integration_id: integration.id }];
      }
    }
  } else if (text.includes("SELECT i.*, u.name, u.email") && text.includes("FROM integrations i") && text.includes("WHERE i.expires_at >")) {
    // Query para buscar integração válida não expirada
    const [expiresAtComparison] = params;
    
    // Filtrar integrações que não expiraram e que têm usuário associado
    const validIntegrations = data.integrations
      .filter(i => {
        const user = data.users.find(u => u.id === i.user_id);
        return user && i.expires_at > expiresAtComparison;
      })
      .map(i => ({
        ...i,
        name: data.users.find(u => u.id === i.user_id)?.name,
        email: data.users.find(u => u.id === i.user_id)?.email
      }))
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
      .slice(0, 1);
    
    result = validIntegrations;
  } else if (text.includes("SELECT * FROM integrations WHERE id = ?")) {
    const [id] = params;
    result = data.integrations.filter(i => i.id === id);
  } else if (text.includes("SELECT * FROM users WHERE id = ?")) {
    const [id] = params;
    result = data.users.filter(u => u.id === id);
  }

  const duration = Date.now() - start;
  console.log("executed query", { text: text.substring(0, 80) + "...", duration, rows: result.length });

  return { rows: result, rowCount: result.length };
};

export const insertUser = (name, email) => {
  const id = data.users.length > 0 ? Math.max(...data.users.map(u => u.id)) + 1 : 1;
  const user = {
    id,
    name,
    email,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  data.users.push(user);
  saveData();
  return user;
};

export const insertIntegration = (userId, provider, metaUserId, accessToken, expiresAt) => {
  const id = data.integrations.length > 0 ? Math.max(...data.integrations.map(i => i.id)) + 1 : 1;
  const integration = {
    id,
    user_id: userId,
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

export const updateUser = (id, name) => {
  const user = data.users.find(u => u.id === id);
  if (user) {
    user.name = name;
    user.updated_at = new Date().toISOString();
    saveData();
  }
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

const connectDatabase = async () => {
  try {
    // Test by reading the file
    JSON.parse(fs.readFileSync(dbPath, "utf8"));
    console.log("✅ Conectado ao armazenamento JSON");
  } catch (error) {
    console.error("❌ Erro ao conectar ao armazenamento JSON:", error.message);
    process.exit(1);
  }
};

export default connectDatabase;

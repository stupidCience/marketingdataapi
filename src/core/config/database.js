import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let dbInstance = null;

export const initDB = async () => {
  if (dbInstance) return dbInstance;

  dbInstance = await open({
    filename: path.resolve(__dirname, '../../../db/database.sqlite'),
    driver: sqlite3.Database
  });

  // Criação das tabelas com a nova estrutura escalável
  await dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT UNIQUE,
      password TEXT,
      client_id INTEGER,
      role TEXT DEFAULT 'user'
    );

    CREATE TABLE IF NOT EXISTS integrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER NOT NULL,
      provider TEXT NOT NULL,
      external_account_id TEXT NOT NULL,
      access_token TEXT NOT NULL,
      refresh_token TEXT,
      expires_at TEXT,
      metadata TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(client_id, provider, external_account_id)
    );

    -- 👇 TABELA DE CONTAS DE ANÚNCIOS UNIVERSAL 👇
    CREATE TABLE IF NOT EXISTS ad_accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER NOT NULL,
      integration_id INTEGER NOT NULL,     -- Liga esta conta à integração que lhe deu origem
      provider TEXT NOT NULL,              -- ex: 'meta', 'google_ads', 'tiktok'
      external_account_id TEXT NOT NULL,   -- ID da conta (Meta: 'act_123', Google: '123-456-7890')
      name TEXT NOT NULL,
      currency TEXT,
      metadata TEXT,                       -- JSON para guardar configs específicas (ex: MCC do Google)
      is_active BOOLEAN DEFAULT 1,         -- Se o utilizador desmarcar a conta no painel, passa a 0
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(client_id, provider, external_account_id) -- Evita duplicar a mesma conta do mesmo provider
    );

    -- 👇 TABELA DE DADOS BRUTOS (O ALICERCE DO BI) 👇
    CREATE TABLE IF NOT EXISTS campaign_metrics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER NOT NULL,
      provider TEXT NOT NULL,        -- ex: 'meta' ou 'google_ads'
      account_id TEXT NOT NULL,      -- ID da conta de anúncios
      campaign_id TEXT NOT NULL,     -- ID da campanha
      campaign_name TEXT,            -- Nome da campanha
      date TEXT NOT NULL,            -- Data no formato YYYY-MM-DD
      currency TEXT,                 -- Moeda (BRL, USD, EUR)
      spend REAL DEFAULT 0,          -- Valor gasto
      impressions INTEGER DEFAULT 0, -- Visualizações
      clicks INTEGER DEFAULT 0,      -- Cliques no link
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      -- A restrição UNIQUE abaixo é o coração do nosso ETL. 
      -- Garante que não teremos a mesma campanha duplicada no mesmo dia.
      UNIQUE(client_id, provider, account_id, campaign_id, date)
    );
  `);

  // Verifica se já existe algum usuário no banco e insere o admin se estiver vazio
  const checkUser = await dbInstance.get(`SELECT COUNT(*) as count FROM users`);
  if (checkUser.count === 0) {
    await dbInstance.run(`
      INSERT INTO users (name, email, password, client_id, role) 
      VALUES ('João Vitor (Admin)', 'joao@marketingdata.com', 'admin123', 1, 'admin')
    `);
    console.log('👤 Usuário padrão (joao@marketingdata.com / admin123) criado com sucesso!');
  }

  console.log('📦 Banco de dados SQLite inicializado com estrutura multi-provedores!');
  return dbInstance;
};

// Wrapper genérico para executar Queries
export const query = async (sqlText, params = []) => {
  const db = await initDB();
  const rows = await db.all(sqlText, params);
  return { rows }; 
};

// Funções de inserção e atualização suportando os campos genéricos
export const insertIntegration = async (clientId, provider, externalAccountId, accessToken, expiresAt, refreshToken = null, metadata = null) => {
  const db = await initDB();
  const metaString = metadata ? JSON.stringify(metadata) : null;
  
  const result = await db.run(
    `INSERT INTO integrations (client_id, provider, external_account_id, access_token, refresh_token, expires_at, metadata) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [clientId, provider, externalAccountId, accessToken, refreshToken, expiresAt, metaString]
  );
  
  return await db.get(`SELECT * FROM integrations WHERE id = ?`, [result.lastID]);
};

export const updateIntegration = async (id, accessToken, expiresAt, refreshToken = null) => {
  const db = await initDB();
  
  // Atualiza os tokens da integração existente
  const sql = refreshToken 
    ? `UPDATE integrations SET access_token = ?, refresh_token = ?, expires_at = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
    : `UPDATE integrations SET access_token = ?, expires_at = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
  
  const params = refreshToken 
    ? [accessToken, refreshToken, expiresAt, id]
    : [accessToken, expiresAt, id];

  await db.run(sql, params);
};
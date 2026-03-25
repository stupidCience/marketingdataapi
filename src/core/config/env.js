import dotenv from "dotenv";

dotenv.config();

export const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta_aqui';
export const PORT = process.env.PORT || 3000;

const requiredEnvVars = [
  "PORT",
  "JWT_SECRET",
  "META_APP_ID",
  "META_APP_SECRET",
  "NODE_ENV"
];

const checkEnvVars = () => {
  const missing = requiredEnvVars.filter(v => !process.env[v]);
  if (missing.length > 0) {
    console.error(`❌ Variáveis de ambiente faltando: ${missing.join(", ")}`);
    process.exit(1);
  }
  console.log("✅ Todas as variáveis de ambiente configuradas");
};

export default checkEnvVars;
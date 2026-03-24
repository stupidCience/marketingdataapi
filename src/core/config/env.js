import dotenv from "dotenv";

dotenv.config();

const requiredEnvVars = [
  "PORT",
  "META_APP_ID",
  "META_APP_SECRET",
  "META_REDIRECT_URI",
  "META_BASE_URL",
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

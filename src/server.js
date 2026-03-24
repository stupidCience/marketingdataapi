import dotenv from "dotenv";

// Carregar variáveis de ambiente ANTES de qualquer altro import
dotenv.config();

import app from "./app.js";
import connectDatabase from "./core/config/database.js";
import checkEnvVars from "./core/config/env.js";

// Validar variáveis de ambiente
checkEnvVars();

// Conectar ao banco de dados
connectDatabase().catch(err => {
  console.error("❌ Falha ao conectar ao armazenamento:", err.message);
  console.error("\n🔧 SOLUÇÕES:");
  console.error("1. Verificar permissões:");
  console.error("   - Certifique-se que a pasta db/ tem permissões de escrita");
  console.error("");
  console.error("2. Recriar arquivo de dados:");
  console.error("   - Delete db/data.json e reinicie a aplicação");
  process.exit(1);
});

const BASE_PORT = parseInt(process.env.PORT, 10) || 3000;

// Inicia servidor na porta configurada e falha em caso de porta ocupada
const startServer = () => {
  const server = app.listen(BASE_PORT, () => {
    console.log(`✅ Servidor rodando na porta ${BASE_PORT}`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`❌ Erro: porta ${BASE_PORT} já está em uso.`);
      console.error(`🔧 Solução: execute 'npm run kill-port' e inicie novamente com 'npm run dev'.`);
      // Não tentar porta alternativa automaticamente para manter URL fixa
      process.exit(1);
    }
    console.error(`❌ Erro ao iniciar servidor: ${error.message}`);
    process.exit(1);
  });

  const handleGracefulShutdown = (signal) => {
    console.log(`\n🛑 ${signal} recebido, desligando...`);
    server.close(() => {
      console.log('✅ Servidor encerrado');
      process.exit(0);
    });
    setTimeout(() => {
      console.error('⚠️ Forçando encerramento...');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));
};

startServer();
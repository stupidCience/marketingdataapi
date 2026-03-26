import dotenv from "dotenv";
dotenv.config(); // Carrega as variáveis de ambiente antes de tudo

import app from "./app.js";
import checkEnvVars, { PORT } from "./core/config/env.js";
import { initDB } from "./core/config/database.js";

// Valida as variáveis de ambiente
checkEnvVars();

const startServer = async () => {
  try {
    // 1. Aguarda a conexão e criação das tabelas no SQLite
    await initDB();

    // 2. Inicia o servidor Express
    const server = app.listen(PORT, () => {
      console.log(`✅ Servidor rodando na porta ${PORT}`);
    });

    // 3. Tratamento de erro de porta ocupada
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Erro: A porta ${PORT} já está em uso.`);
        console.error(`🔧 Dica: Execute 'npm run kill-port' e tente novamente.`);
      } else {
        console.error(`❌ Erro ao iniciar servidor: ${error.message}`);
      }
      process.exit(1);
    });

    // 4. Desligamento gracioso (Graceful Shutdown)
    const gracefulShutdown = (signal) => {
      console.log(`\n🛑 Sinal ${signal} recebido. Encerrando servidor...`);
      
      server.close(() => {
        console.log('✅ Servidor encerrado com segurança.');
        process.exit(0);
      });

      // Força o encerramento se alguma requisição travar por mais de 10s
      setTimeout(() => {
        console.error('⚠️ Tempo limite excedido. Forçando encerramento...');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error("❌ Falha crítica ao inicializar a aplicação:", error.message);
    process.exit(1);
  }
};

startServer();
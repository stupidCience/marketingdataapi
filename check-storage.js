import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'db/data.json');

function checkJSONStorage() {
  try {
    console.log('🔍 Verificando armazenamento JSON...');

    if (!fs.existsSync(dbPath)) {
      console.log('📝 Arquivo de dados não existe, criando...');
      const initialData = { users: [], integrations: [] };
      fs.writeFileSync(dbPath, JSON.stringify(initialData, null, 2));
    }

    const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    console.log('✅ Armazenamento JSON está funcionando!');
    console.log(`📍 Arquivo: ${dbPath}`);
    console.log(`📊 Usuários: ${data.users.length}, Integrações: ${data.integrations.length}`);

    process.exit(0);
  } catch (error) {
    console.log('❌ Armazenamento JSON não está acessível:');
    console.log(`   Erro: ${error.message}`);
    console.log('');
    console.log('🔧 SOLUÇÕES:');
    console.log('');
    console.log('1. Verificar permissões:');
    console.log('   ▶️ Certifique-se que a pasta db/ tem permissões de escrita');
    console.log('');
    console.log('2. Recriar arquivo:');
    console.log('   ▶️ Delete db/data.json e execute novamente');
    process.exit(1);
  }
}

checkJSONStorage();
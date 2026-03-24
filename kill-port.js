#!/usr/bin/env node

import { execSync } from 'child_process';
import { platform } from 'os';

const PORT = process.argv[2] || 3000;

console.log(`🔍 Procurando processos na porta ${PORT}...`);

try {
  if (platform() === 'win32') {
    // Windows
    const result = execSync(`netstat -ano | findstr :${PORT}`, { encoding: 'utf8' });
    
    if (!result.trim()) {
      console.log(`✅ Nenhum processo encontrado na porta ${PORT}`);
      process.exit(0);
    }

    // Extrair PIDs
    const lines = result.trim().split('\n');
    const pids = new Set();

    lines.forEach(line => {
      const match = line.match(/\s+(\d+)\s*$/);
      if (match) pids.add(match[1]);
    });

    if (pids.size === 0) {
      console.log(`✅ Nenhum processo encontrado na porta ${PORT}`);
      process.exit(0);
    }

    console.log(`⚠️  Encontrados ${pids.size} processo(s) na porta ${PORT}`);

    pids.forEach(pid => {
      if (pid !== process.pid.toString()) {
        try {
          console.log(`🛑 Matando PID ${pid}...`);
          execSync(`taskkill /PID ${pid} /F`, { stdio: 'pipe' });
          console.log(`✅ PID ${pid} finalizado`);
        } catch (e) {
          console.error(`❌ Erro ao finalizar PID ${pid}:`, e.message);
        }
      }
    });
  } else {
    // macOS/Linux
    const result = execSync(`lsof -i :${PORT}`, { encoding: 'utf8' });
    
    if (!result.trim()) {
      console.log(`✅ Nenhum processo encontrado na porta ${PORT}`);
      process.exit(0);
    }

    const lines = result.trim().split('\n').slice(1); // Skip header
    const pids = new Set();

    lines.forEach(line => {
      const parts = line.split(/\s+/);
      if (parts[1]) pids.add(parts[1]);
    });

    if (pids.size === 0) {
      console.log(`✅ Nenhum processo encontrado na porta ${PORT}`);
      process.exit(0);
    }

    console.log(`⚠️  Encontrados ${pids.size} processo(s) na porta ${PORT}`);

    pids.forEach(pid => {
      if (pid !== process.pid.toString()) {
        try {
          console.log(`🛑 Matando PID ${pid}...`);
          execSync(`kill -9 ${pid}`, { stdio: 'pipe' });
          console.log(`✅ PID ${pid} finalizado`);
        } catch (e) {
          console.error(`❌ Erro ao finalizar PID ${pid}:`, e.message);
        }
      }
    });
  }

  console.log(`\n✅ Porta ${PORT} liberada! Você pode iniciar o servidor agora.`);
} catch (error) {
  console.error(`❌ Erro:`, error.message);
  process.exit(1);
}

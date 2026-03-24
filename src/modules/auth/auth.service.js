// src/modules/auth/auth.service.js
import jwt from 'jsonwebtoken';
import { query } from '../../core/config/database.js';

export const login = async (email, password) => {
  // 1. Buscar o usuário no banco (data.json)
  const userResult = await query(`SELECT * FROM users WHERE email = ? LIMIT 1`, [email]);
  const user = userResult.rows.length > 0 ? userResult.rows[0] : null;

  if (!user) {
    const error = new Error('Credenciais inválidas: usuário não encontrado');
    error.statusCode = 401;
    throw error;
  }

  // 2. Verificar a senha (Simples por enquanto)
  const isMatch = password === "admin123"; 

  if (!isMatch) {
    const error = new Error('Credenciais inválidas: senha incorreta');
    error.statusCode = 401;
    throw error;
  }

  // 3. Gerar o Token JWT incluindo o clientId (Multi-tenant)
  const token = jwt.sign(
    { 
      id: user.id, 
      clientId: user.client_id, 
      role: user.role 
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      clientId: user.client_id
    }
  };
};
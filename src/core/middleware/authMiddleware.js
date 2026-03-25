import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env.js';
import responseUtil from '../utils/response.util.js';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return responseUtil.error(res, 'Token não fornecido', 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    req.clientId = decoded.clientId;
    req.userRole = decoded.role;
    next();
  } catch (err) {
    return responseUtil.error(res, 'Token inválido ou expirado', 401);
  }
};
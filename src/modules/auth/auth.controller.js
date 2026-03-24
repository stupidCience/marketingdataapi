import * as authService from './auth.service.js';
import { successResponse, errorResponse } from '../../core/utils/response.util.js';

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return errorResponse(res, "Email e senha são obrigatórios", 400);
    }

    const data = await authService.login(email, password);
    
    return successResponse(res, data, "Login realizado com sucesso!");
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};
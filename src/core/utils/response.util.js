// src/core/utils/response.util.js

/**
 * Formata todas as respostas de sucesso da API.
 */
export const successResponse = (res, data = null, message = "Operação realizada com sucesso", statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

/**
 * Formata todas as respostas de erro da API.
 */
export const errorResponse = (res, message = "Ocorreu um erro no servidor", statusCode = 500, errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors
  });
};

// ✅ EXPORT DEFAULT: Mapeia os nomes longos para os nomes curtos que o middleware usa
export default {
  success: successResponse,
  error: errorResponse
};
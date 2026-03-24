import { successResponse, errorResponse } from "../../../core/utils/response.util.js";
import { getAdAccounts } from "../services/adsService.js";

export const fetchAdAccounts = async (req, res) => {
  try {
    // 1. Pegamos o token injetado pelo authMiddleware
    const token = req.user?.token;
    
    // 2. Chamamos o Serviço
    const accounts = await getAdAccounts(token);
    
    // 3. Devolvemos a resposta padronizada
    return successResponse(res, accounts, "Contas de anúncios recuperadas com sucesso!");
  } catch (error) {
    console.error("🔥 Erro ao buscar contas de anúncios:", error.message);
    const statusCode = error.response?.status || 500;
    
    return errorResponse(res, error.message || "Erro ao buscar contas de anúncios", statusCode);
  }
};
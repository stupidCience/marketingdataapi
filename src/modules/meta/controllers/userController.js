import { successResponse, errorResponse } from "../../../core/utils/response.util.js";
import { getUserProfile } from "../services/userService.js";

export const fetchUser = async (req, res) => {
  try {
    const token = req.user?.token;
    const user = await getUserProfile(token);
    
    return successResponse(res, user, "Usuário recuperado com sucesso!");
  } catch (error) {
    console.error("🔥 Erro ao buscar usuário:", error.message);
    const statusCode = error.response?.status || 500;
    
    return errorResponse(res, error.message || "Erro ao buscar usuário", statusCode);
  }
};
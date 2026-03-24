import { createMetaAPI } from "../../../core/config/api.js";

export const getUserProfile = async (accessToken) => {
  if (!accessToken) throw new Error("Token de acesso é obrigatório");

  try {
    const api = createMetaAPI(accessToken);
    const response = await api.get("/me", {
      params: { fields: "id,name" },
    });

    return response.data;
  } catch (error) {
    const metaError = error.response?.data?.error?.message || error.message;
    
    const customError = new Error(`Falha na Meta API (UserProfile): ${metaError}`);
    customError.statusCode = error.response?.status || 500;
    
    throw customError;
  }
};
import { createMetaAPI } from "../../../core/config/api.js";

export const getAdAccounts = async (accessToken) => {
  if (!accessToken) throw new Error("Token de acesso é obrigatório");

  try {
    const api = createMetaAPI(accessToken);
    const response = await api.get("/me/adaccounts", {
      params: { fields: "id,name,account_status,currency" },
    });
    
    return response.data.data;
  } catch (error) {
    // Extraímos a mensagem exata que o Facebook nos enviou
    const metaError = error.response?.data?.error?.message || error.message;
    
    // Criamos um erro customizado e injetamos o status code para o Controller ler
    const customError = new Error(`Falha na Meta API (AdAccounts): ${metaError}`);
    customError.statusCode = error.response?.status || 500;
    
    throw customError;
  }
};
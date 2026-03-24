import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

export const createMetaAPI = (accessToken) => {
  if (!accessToken) {
    throw new Error("Access token é obrigatório para criar instância da API");
  }
  
  return axios.create({
    baseURL: process.env.META_BASE_URL,
    params: {
      access_token: accessToken,
    },
  });
};

// Para manter compatibilidade com código existente que usa token estático
const api = axios.create({
  baseURL: process.env.META_BASE_URL,
  params: {
    access_token: process.env.META_ACCESS_TOKEN,
  },
});

export default api;
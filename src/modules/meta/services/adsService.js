import { createMetaAPI } from "../../../core/config/api.js";

export const getAdAccounts = async (accessToken) => {
    if (!accessToken) {
        throw new Error("Token de acesso é obrigatório");
    }

    try {
        const api = createMetaAPI(accessToken);
        const response = await api.get("/me/adaccounts", {
            params: {
                fields: "id,name,account_status,currency",
            },
        });
        return response.data.data;
    } catch (error) {
        console.error("Erro na Graph API: ", error.response?.data || error.message);
        throw error;
    }
};
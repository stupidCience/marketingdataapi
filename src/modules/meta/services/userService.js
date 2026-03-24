import { createMetaAPI } from "../../../core/config/api.js";

export const getUserProfile = async (accessToken) => {
    if (!accessToken) {
        throw new Error("Token de acesso é obrigatório");
    }

    try {
        const api = createMetaAPI(accessToken);
        const response = await api.get("/me", {
            params: {
                fields: "id,name",
            },
        });

        return response.data;
    } catch (error) {
        console.error("Erro na Graph API: ", error.response?.data || error.message);
        throw error;
    }
};
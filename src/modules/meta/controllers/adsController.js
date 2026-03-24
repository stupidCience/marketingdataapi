import { getAdAccounts } from "../services/adsService.js";

export const fetchAdAccounts = async (req, res) => {
    try {
        const accounts = await getAdAccounts(req.accessToken);
        res.json(accounts);
    } catch (error) {
        console.error("Erro ao buscar contas de anúncios:", error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            error: "Erro ao buscar contas de anúncios",
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
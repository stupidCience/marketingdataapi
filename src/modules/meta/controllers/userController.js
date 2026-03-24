import { getUserProfile } from "../services/userService.js";

export const fetchUser = async (req, res) => {
    try {
        const user = await getUserProfile(req.accessToken);
        res.json(user);
    } catch (error) {
        console.error("Erro ao buscar usuário:", error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            error: "Erro ao buscar usuário",
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
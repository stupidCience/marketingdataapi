// src/modules/meta/controllers/adsController.js
import adsService from '../services/adsService.js';
import responseUtil from '../../../core/utils/response.util.js'; 
import { getSavedAdAccounts, getCampaignMetrics } from '../repositories/metaAccount.repository.js';

export const fetchAvailableAccounts = async (req, res) => {
  try {
    const ads = await adsService.getAvailableAccounts(req.clientId);
    return responseUtil.success(res, ads, 'Contas disponíveis recuperadas.');
  } catch (error) {
    return responseUtil.error(res, error.message, 500);
  }
};

export const fetchAdAccounts = async (req, res) => {
  try {
    const ads = await adsService.getSavedAccountsWithMetrics(req.clientId);
    return responseUtil.success(res, ads, 'Contas recuperadas com sucesso.');
  } catch (error) {
    return responseUtil.error(res, error.message, 500);
  }
};

export const saveSelectedAccounts = async (req, res) => {
  try {
    const { accounts } = req.body; 
    await adsService.saveAccounts(req.clientId, accounts);
    return responseUtil.success(res, null, 'Contas guardadas com sucesso.');
  } catch (error) {
    return responseUtil.error(res, error.message, 500);
  }
};

export const fetchSavedAccounts = async (req, res) => {
  try {
    const accounts = await getSavedAdAccounts(req.clientId, 'meta');
    return responseUtil.success(res, accounts, 'Contas guardadas recuperadas.');
  } catch (error) {
    return responseUtil.error(res, error.message, 500);
  }
};

export const triggerMetricsSync = async (req, res) => {
  try {
    const result = await adsService.syncCampaignMetrics(req.clientId);
    return responseUtil.success(res, result, 'Sincronização de métricas concluída.');
  } catch (error) {
    return responseUtil.error(res, error.message, 500);
  }
};

// 👇 A ROTA QUE ESTAVA DANDO 500 AGORA TEM LOG 👇
export const fetchMetricsData = async (req, res) => {
  try {
    const metrics = await getCampaignMetrics(req.clientId, 'meta');
    return responseUtil.success(res, metrics, 'Dados brutos recuperados.');
  } catch (error) {
    console.error("🔥 ERRO NA ROTA GET /metrics:", error); // <-- O megafone!
    return responseUtil.error(res, error.message, 500);
  }
};
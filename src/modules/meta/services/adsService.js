// src/modules/meta/services/adsService.js
import axios from 'axios';
import { getValidIntegration, saveSelectedAdAccounts, getSavedAdAccounts, upsertCampaignMetrics } from '../repositories/metaAccount.repository.js'; 

class AdsService {
  async getAvailableAccounts(clientId) {
    const integration = await getValidIntegration(clientId);
    if (!integration || !integration.access_token) return []; 

    try {
      const response = await axios.get('https://graph.facebook.com/v19.0/me/adaccounts', {
        params: {
          access_token: integration.access_token,
          fields: 'account_id,name,account_status,currency' 
        }
      });
      return response.data.data;
    } catch (error) {
      throw new Error('Falha ao buscar as contas disponíveis no Facebook.');
    }
  }

  async getSavedAccountsWithMetrics(clientId) {
    const integration = await getValidIntegration(clientId);
    if (!integration || !integration.access_token) return []; 

    const savedAccounts = await getSavedAdAccounts(clientId, 'meta');
    const savedIds = savedAccounts.map(acc => acc.external_account_id);

    if (savedIds.length === 0) return [];

    try {
      const response = await axios.get('https://graph.facebook.com/v19.0/me/adaccounts', {
        params: {
          access_token: integration.access_token,
          fields: 'account_id,name,account_status,currency,amount_spent' 
        }
      });

      const allAccountsFromFB = response.data.data;
      return allAccountsFromFB.filter(account => savedIds.includes(account.account_id));
    } catch (error) {
      throw new Error('Falha ao buscar as contas de anúncio no Facebook.');
    }
  }

  async saveAccounts(clientId, accounts) {
    if (!accounts || !Array.isArray(accounts)) {
      throw new Error('O formato das contas enviadas é inválido.');
    }
    const integration = await getValidIntegration(clientId);
    if (!integration) {
      throw new Error('Nenhuma integração ativa encontrada.');
    }
    await saveSelectedAdAccounts(clientId, integration.id, 'meta', accounts);
  }

  // 👇 MOTOR DE ETL COM PAGINAÇÃO 👇
  async syncCampaignMetrics(clientId) {
    const integration = await getValidIntegration(clientId);
    if (!integration || !integration.access_token) {
      throw new Error('Integração com a Meta não encontrada ou inválida.');
    }

    const savedAccounts = await getSavedAdAccounts(clientId, 'meta');
    if (savedAccounts.length === 0) {
       return { message: "Nenhuma conta selecionada para sincronizar." };
    }

    let totalSynced = 0;

    for (const account of savedAccounts) {
      try {
        const actId = account.external_account_id.startsWith('act_') ? account.external_account_id : `act_${account.external_account_id}`;

        // 1. Configuração inicial (Primeira Página)
        let nextUrl = `https://graph.facebook.com/v19.0/${actId}/insights`;
        let params = {
          access_token: integration.access_token,
          level: 'campaign',
          fields: 'campaign_id,campaign_name,spend,impressions,clicks', 
          time_increment: 1, 
          date_preset: 'last_30d' 
        };

        // 2. Loop de Paginação (Continua enquanto houver uma URL "next")
        while (nextUrl) {
          const requestConfig = Object.keys(params).length > 0 ? { params } : {};
          const response = await axios.get(nextUrl, requestConfig);
          
          const metricsData = response.data.data;

          // 3. Transformação e Carga no Banco
          if (metricsData && metricsData.length > 0) {
            const formattedMetrics = metricsData.map(row => ({
              campaign_id: row.campaign_id,
              campaign_name: row.campaign_name,
              date_start: row.date_start, 
              currency: account.currency || 'BRL',
              spend: parseFloat(row.spend || 0),
              impressions: parseInt(row.impressions || 0, 10),
              clicks: parseInt(row.clicks || 0, 10)
            }));

            await upsertCampaignMetrics(clientId, 'meta', account.external_account_id, formattedMetrics);
            totalSynced += formattedMetrics.length;
          }

          // 4. Checa se o Facebook enviou mais páginas
          if (response.data.paging && response.data.paging.next) {
            nextUrl = response.data.paging.next;
            params = {}; // Limpamos os params porque a URL "next" já traz tudo embutido!
          } else {
            nextUrl = null; // Fim das páginas, quebra o loop
          }
        }
      } catch (err) {
        console.error(`Erro ao sincronizar conta ${account.external_account_id}:`, err.response?.data?.error?.message || err.message);
      }
    }

    return { success: true, total_records: totalSynced };
  }
}

export default new AdsService();
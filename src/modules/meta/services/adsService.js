import metaAccountRepository from '../repositories/metaAccount.repository.js';

class AdsService {
  async getAds(clientId) {
    // Busca contas integradas no banco de dados local
    const accounts = await metaAccountRepository.findByClientId(clientId);
    
    if (!accounts || accounts.length === 0) {
      return [];
    }

    return accounts;
  }
}

export default new AdsService();
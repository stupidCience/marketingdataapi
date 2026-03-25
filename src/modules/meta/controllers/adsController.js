import adsService from '../services/adsService.js';

export const fetchAdAccounts = async (req, res) => {
  try {
    const ads = await adsService.getAds(req.clientId);
    res.json({ 
      success: true, 
      data: ads 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};
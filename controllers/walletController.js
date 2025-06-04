

const {getHomeScreenData,sendCrypto,getTransactionById,getTransactionHistory,getNFTs} = require('./../services/walletService')



exports.homeScreen = async (req, res) => {
        try {
          const result = await getHomeScreenData(req.body.address);
          res.json(result);
        } catch (err) {
          res.status(500).json({ error: err.message });
        }
      };
      
      exports.sendCrypto = async (req, res) => {
        try {
          const { privateKey, to, amount, chain } = req.body;
          const result = await sendCrypto(privateKey, to, amount, chain);
          res.json(result);
        } catch (err) {
          res.status(500).json({ error: err.message });
        }
      };
      
      exports.getTransactionById = async (req, res) => {
        try {
          const { id } = req.params;
          const result = await getTransactionById(id);
          res.json(result);
        } catch (err) {
          res.status(500).json({ error: err.message });
        }
      };
      
      exports.getTransactionHistory = async (req, res) => {
        try {
          const { address } = req.params;
          const { filter, chain } = req.query;
          const result = await getTransactionHistory(address, chain, filter);
          res.json(result);
        } catch (err) {
          res.status(500).json({ error: err.message });
        }
      };
      
      exports.getMyNFTs = async (req, res) => {
        try {
          const { address } = req.params;
          const result = await    getNFTs(address);
          res.json(result);
        } catch (err) {
          res.status(500).json({ error: err.message });
        }
      };
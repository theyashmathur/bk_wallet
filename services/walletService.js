const axios = require('axios');
// const Web3 = require('web3');
// const web3 = new Web3(new Web3.providers.HttpProvider(process.env.INFURA_URL));
// const moralis = axios.create({
//   baseURL: 'https://deep-index.moralis.io/api/v2',
//   headers: { 'X-API-Key': process.env.MORALIS_API_KEY },
// });

exports.getHomeScreenData = async (address) => {
  const [tokens, nfts, txs] = await Promise.all([
    moralis.get(`/wallets/${address}/balances?chain=eth`),
    moralis.get(`/wallets/${address}/nft?chain=eth`),
    moralis.get(`/wallets/${address}/transactions?chain=eth`),
  ]);
  return {
    totalBalance: tokens.data.reduce((acc, token) => acc + parseFloat(token.balance), 0),
    assets: tokens.data,
    recentTransactions: txs.data.result.slice(0, 5),
  };
};

exports.sendCrypto = async (privateKey, to, amount, chain = 'eth') => {
  const account = web3.eth.accounts.privateKeyToAccount(privateKey);
  const tx = {
    to,
    value: web3.utils.toWei(amount, 'ether'),
    gas: 21000,
  };
  const signed = await account.signTransaction(tx);
  return await web3.eth.sendSignedTransaction(signed.rawTransaction);
};

exports.getTransactionById = async (txHash) => {
  const tx = await web3.eth.getTransaction(txHash);
  return tx;
};

exports.getTransactionHistory = async (address, chain = 'eth', filter = 'all') => {
  const txs = await moralis.get(`/wallets/${address}/transactions`, { params: { chain } });
  let filtered = txs.data.result;
  if (filter === 'sent') filtered = filtered.filter(tx => tx.from_address.toLowerCase() === address.toLowerCase());
  if (filter === 'received') filtered = filtered.filter(tx => tx.to_address.toLowerCase() === address.toLowerCase());
  return filtered;
};

exports.getNFTs = async (address, chain = 'eth') => {
  const res = await moralis.get(`/wallets/${address}/nft`, { params: { chain } });
  return res.data.result;
};
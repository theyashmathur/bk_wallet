const express = require("express");
const app = express();
const ethers = require('ethers');
const WalletOwner = require('./../models/WalletOwner');
const {createAddressForOwner} = require('./../utils/addressCreator')
const WalletAddress = require('./../models/WalletAddress');
const {encrypt} = require('./encryption');


/// @note: Function to create an initial wallet for ADMIN purpose
/// Also creates the first address
/// Should be used to bear gas fees for admin and hold NFTs
/// @param {string} userId - admin user ID
const createInitialWallet = async (userId) => {
  //userid : Admin
  const existing = await WalletOwner.findOne({ userId });
  if (existing) {
      console.log("Wallet already exists.");
      return;
  }

  // Create a new wallet with mnemonic
  const wallet = ethers.Wallet.createRandom();
  const mnemonic = wallet.mnemonic.phrase;

  // Encrypt the private key before saving
  const encryptedPrivateKey = encrypt(wallet.privateKey);

  // Create the wallet owner with all required fields
  const owner = await WalletOwner.create({
      userId,
      walletAddress: wallet.address,
      privateKey: encryptedPrivateKey,
      mnemonic
  });

  // const derivationPath = `m/44'/60'/0'/0/${index}`;
  const hdNode = ethers.HDNodeWallet.fromPhrase(mnemonic);

   // const derivationPath = `m/44'/60'/0'/0/${index}`;
   const wallet_2 = new ethers.Wallet(hdNode.privateKey);

   // Encrypt the private key before saving
   const encryptedPrivateKey_2 = encrypt(wallet.privateKey);

   await WalletAddress.create({
       ownerId:owner._id,
       userId: owner.userId,
       address: wallet_2.address,
       privateKey: encryptedPrivateKey_2,
       derivationPath: `m/44'/60'/0'/0/${0}`,
       index:0
   });
};


module.exports = {
  createInitialWallet :createInitialWallet
}
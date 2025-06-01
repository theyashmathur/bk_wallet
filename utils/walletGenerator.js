const express = require("express");
const app = express();
const ethers = require('ethers');
const WalletOwner = require('./../models/WalletOwner');
const {createAddressForOwner} = require('./../utils/addressCreator')
const {encrypt} = require('./encryption');


/// @note: Function to create an initial wallet for ADMIN purpose
/// Also creates the first address
/// Should be used to bear gas fees for admin and hold NFTs
/// @param {string} userId - admin user ID
const createInitialWallet = async (userId) => {
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

  console.log("owner wallet created here is the owner->> ",owner)

  await createAddressForOwner(owner._id, mnemonic, 0);

  console.log("Initial wallet and first address created.");
};


module.exports = {
  createInitialWallet :createInitialWallet
}
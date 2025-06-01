const express = require("express");
const app = express();
const WalletOwner = require('./../models/WalletOwner');
const WalletAddress = require('./../models/WalletAddress');
const ethers = require('ethers');
const {encrypt,decrypt} = require('./encryption')



/// @note: This function is used to create a new address using the same mnemonic
/// @param {string} ownerId - ID of the wallet owner
/// @param {string} mnemonic - mnemonic phrase of the wallet owner
/// @param {number} index - index for the new address
const createAddressForOwner = async (ownerId, mnemonic, index) => {
    // Get the owner to fetch userId
    const owner = await WalletOwner.findById(ownerId);
    if (!owner) {
        throw new Error("Wallet owner not found");
    }

    // Create HD wallet from mnemonic
    const hdNode = ethers.HDNodeWallet.fromPhrase(mnemonic);
    // Derive child wallet at specified index
    const wallet = hdNode.deriveChild(index);

    // Encrypt the private key before saving
    const encryptedPrivateKey = encrypt(wallet.privateKey);

    const address = await WalletAddress.create({
        ownerId,
        userId: owner.userId,
        address: wallet.address,
        privateKey: encryptedPrivateKey,
        derivationPath: `m/44'/60'/0'/0/${index}`,
        index
    });

    console.log("wallet address created->>>", address);
    console.log(`Address ${index} generated and saved: ${wallet.address}`);
};


/// @note: This function generates the next address for a given user
const generateNextAddress = async (ownerId, userId) => {

        // Checks if the userId for admin wallet is valid
        const admin = await WalletOwner.findOne({ ownerId });
        
        if(!admin) {
            console.log("Admin wallet not found.");
            return;
        }
    
        const latest = await WalletAddress.find({ userId: userId })
            .sort({ index: -1 })
            .limit(1);
    
        const nextIndex = latest.length ? latest[0].index + 1 : 0;
    
        await createAddressForOwner(userId, owner.mnemonic, nextIndex);
    };


    module.exports = {
        generateNextAddress :generateNextAddress,
        createAddressForOwner : createAddressForOwner
      }
const express = require("express");
const app = express();
const WalletOwner = require('./../models/WalletOwner');
const WalletAddress = require('./../models/WalletAddress');
const {ethers,Mnemonic} = require('ethers');
const { TronWeb } = require('tronweb');

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

    // const derivationPath = `m/44'/60'/0'/0/${index}`;
    const hdNode = ethers.HDNodeWallet.fromPhrase(mnemonic);
    const wallet = new ethers.Wallet(hdNode.privateKey);

    // Encrypt the private key before saving
    const encryptedPrivateKey = encrypt(wallet.privateKey);

    await WalletAddress.create({
        ownerId,
        userId: owner.userId,
        address: wallet.address,
        privateKey: encryptedPrivateKey,
        derivationPath: `m/44'/60'/0'/0/${index}`,
        index
    });

    // console.log("wallet address created->>>",address);

    console.log(`Address ${index} generated and saved: ${wallet.address}`);
};


/// @note: This function generates the next address for a given user
const generateNextAddress = async (ownerId, userId) => {
//ownerId : Admin , userId : newly generated userId
        // Checks if the userId for admin wallet is valid
        const owner = await WalletOwner.findOne({ userId:ownerId });
        
        if(!owner) {
            console.log("Admin wallet not found.");
            return;
        }
    
        const latest = await WalletAddress.find()
            .sort({ index: -1 })
            .limit(1);
        console.log("latest is ",latest)
        const nextIndex = latest.length ? latest[0].index + 1 : 0;
        console.log("nextIndex->>",nextIndex)
        // await createAddressForOwner(userId, owner.mnemonic, nextIndex);
            // Get the owner to fetch userId

    // const derivationPath = `m/44'/60'/0'/0/${index}`;
  
    const hdNode = ethers.HDNodeWallet.fromPhrase(owner.mnemonic);
    const wallet = hdNode.deriveChild(nextIndex);
    const path = `m/44'/60'/0'/0/${nextIndex}`;
    const nextWallet = hdNode.derivePath(path);

    
        
    // const hdRoot = ethers.HDNodeWallet.fromMnemonic(mnemonicObj);
    // const childNode = hdRoot.derivePath(`m/44'/60'/0'/0/${nextIndex}`);
    // const wallet = new ethers.Wallet(childNode.privateKey);
    // Encrypt the private key before saving
    const encryptedPrivateKey = encrypt(nextWallet.privateKey);

   try {
   const w_address =  await WalletAddress.create({
        // ownerId,
        ownerId: owner._id,  
        userId:userId,
        address: nextWallet.address,
        privateKey: encryptedPrivateKey,
        derivationPath: path,
        // nextIndex
        index: nextIndex  
    });

    console.log(w_address);
   }catch(err){
    console.log(err);
   }
    };


/// @note: This function creates a new Tron address for a user
/// @param {string} ownerId - Admin user ID
/// @param {string} userId - User ID for whom to generate the address
const createTronAddress = async (userId) => {
    try {
        
        const tronWeb = new TronWeb({
            fullHost: "https://nile.tronscanapi.com"    // Testnet rpc url
        });

        // Create new Tron account
        const account = tronWeb.createAccount();
        console.log("Generated Tron address:", account.address.base58);

        // Encrypt the private key before saving
        const encryptedPrivateKey = encrypt(account.privateKey);

        // Save the address to database
        const address = await WalletAddress.create({});

        console.log("New Tron wallet address created:", address);
        return address;
    } catch (error) {
        console.error("Error in createTronAddress:", error);
        throw error;
    }
};


module.exports = {
    generateNextAddress,
    createAddressForOwner,
    createTronAddress
};
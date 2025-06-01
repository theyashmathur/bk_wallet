const mongoose = require("mongoose");

const WalletOwnerSchema = new mongoose.Schema({
    userId: { type: String, required: true }, // associated to ADMIN
    walletAddress: { type: String, required: true },
    privateKey: { type: String, required: true },
    mnemonic: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports =  mongoose.model("WalletOwner", WalletOwnerSchema);






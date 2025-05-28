





/// @note: Function to create an initial wallet for ADMIN purpose
/// Also creates the first address
/// Should be used to bear gas fees for admin and hold NFTs
/// @param {string} userId - admin user ID
const createInitialWallet = async (userId) => {
        const existing = await findOne({ userId });
        if (existing) {
            console.log("Wallet already exists.");
            return;
        }
      
        const mnemonic = ethers.Wallet.createRandom().mnemonic.phrase;
      
        const owner = await WalletOwner.create({ userId, mnemonic });
      
        await createAddressForOwner(owner._id, mnemonic, 0);
      
        console.log("Initial wallet and first address created.");
      };
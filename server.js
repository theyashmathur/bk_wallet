const express = require("express");
const app = express();
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
dotenv.config();
const logger = require('./utils/logger');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');


// Create a write stream for access logs
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'logs', 'access.log'), { flags: 'a' });

// Log HTTP requests
app.use(morgan('combined', { stream: accessLogStream }));
app.use(morgan('dev')); // Optional: logs to console in dev mode


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1", authRoutes);






// Connect to DB and start server
 connectDB().then(async() => {

  const userId = "admin";

  // await createInitialWallet(userId);      // To be called once to create admin wallet
  // await createAddressForOwner(userId, mnemonic, 0); // To be called once to create first address
  await generateNextAddress(userId);      // Reusable to create more addresses
  app.listen(process.env.PORT, () =>
  logger.info(`🚀 Server running on http://localhost:${process.env.PORT}`)
  );
});
















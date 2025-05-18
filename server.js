const express = require("express");
const app = express();
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");

dotenv.config();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1", authRoutes);






// Connect to DB and start server
connectDB().then(() => {
  app.listen(process.env.PORT, () =>
    console.log(`🚀 Server running on http://localhost:${process.env.PORT}`)
  );
});

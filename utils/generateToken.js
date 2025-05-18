// utils/generateToken.js
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const generateToken = (user) => {
  return jwt.sign(
    {
      _id: user._id,
      mobileNumber: user.mobileNumber,
      countryCode: user.countryCode,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    }
  );
};




const generateResetToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

module.exports = { generateToken,generateResetToken}

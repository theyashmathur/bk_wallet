const Joi = require("joi");
const User = require("./../models/user.model");
const sendEmail = require("../utils/sendEmail");
const sendSMS = require("../utils/sendSMS");
const bcrypt = require("bcryptjs");
const {generateToken }= require("../utils/generateToken"); 
const crypto = require("crypto");
const jwt = require("jsonwebtoken");


const register = async (req, res) => {
        try {
          const schema = Joi.object({
            country: Joi.string().required(),
            fullName: Joi.string().required(),
            userName: Joi.string().required(),
            email: Joi.string().email().required(),
            mobileNumber: Joi.string().pattern(/^[0-9]{10}$/).required(),
            countryCode: Joi.string().required(),
            password: Joi.string().min(6).required(),
          });
      
          const { error } = schema.validate(req.body);
          if (error) return res.status(400).json({ error: error.details[0].message });
      
          const {
            country,
            fullName,
            userName,
            email,
            mobileNumber,
            countryCode,
            password
          } = req.body;
      
          const existingUser = await User.findOne({
            $or: [{ email }, { mobileNumber }, { userName }]
          });
          if (existingUser) return res.status(400).json({ error: "User already exists" });
      
          const hashedPassword = await bcrypt.hash(password, 10);
      
          // Generate OTPs
          const emailOtp = Math.floor(100000 + Math.random() * 900000).toString();
          const mobileOtp = Math.floor(100000 + Math.random() * 900000).toString();
      
          const newUser = new User({
            country,
            fullName,
            userName,
            email,
            mobileNumber,
            countryCode,
            password: hashedPassword,
            emailOtp,
            emailOtpExpiry: new Date(Date.now() + 10 * 60 * 1000),
            mobileOtp,
            mobileOtpExpiry: new Date(Date.now() + 10 * 60 * 1000),
          });
      
          // Send OTPs (dummy for now)
          // await sendEmail(email, "Your Email OTP", `OTP: ${emailOtp}`);
          // await sendSMS(mobileNumber, `Your Mobile OTP: ${mobileOtp}`);
      
          const token = generateToken(newUser);
          await newUser.save();
      
          res.status(201).json({
            message: "User registered. OTPs sent to email and mobile.",
            token,
            user: {
              fullName: newUser.fullName,
              mobileNumber: newUser.mobileNumber,
              countryCode: newUser.countryCode,
              email: newUser.email,
            },
          });
        } catch (err) {
          console.error("Registration error:", err);
          res.status(500).json({ error: "Internal Server Error" });
        }
      };
      


const login = async (req, res) => {
        try {
          const { mobileNumber, password ,countryCode} = req.body;
      
          // Check if both fields exist
          if (!mobileNumber || !password || !countryCode) {
            return res.status(400).json({ message: "All fields are required" });
          }
      
          // Check if user exists
          const user = await User.findOne({ mobileNumber,countryCode });
          if (!user) {
            return res.status(404).json({ message: "User not found" });
          }
      
          // Compare password
          const isMatch = await bcrypt.compare(password, user.password);
          if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
          }
      
          // Optional: generate token here if needed (JWT)
          const token = generateToken(user);

          return res.status(200).json({
            message: "Login successful",
            token,
            user: {
        //       _id: user._id,
              fullName: user.fullName,
              mobileNumber: user.mobileNumber,
              countryCode: user.countryCode,
              email: user.email,
            },
          });
        } catch (error) {
          console.error("Login Error:", error);
          return res.status(500).json({ message: "Internal Server Error" });
        }
      };




const sendOrResendOtp = async (req, res) => {
  try {
    const { email, mobileNumber, countryCode, via } = req.body;

    if (!via || (via !== "email" && via !== "mobile")) {
      return res.status(400).json({ message: "Invalid 'via' method. Use 'email' or 'mobile'" });
    }

    let user;

    if (via === "email") {
      if (!email) return res.status(400).json({ message: "Email is required" });

      user = await User.findOne({ email });
      if (!user) return res.status(404).json({ message: "User not found with this email" });
    } else if (via === "mobile") {
      if (!mobileNumber || !countryCode) {
        return res.status(400).json({ message: "Mobile number and country code are required" });
      }

      user = await User.findOne({ mobileNumber, countryCode });
      if (!user) return res.status(404).json({ message: "User not found with this mobile number" });
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
    await user.save();

    // Send OTP
    if (via === "email") {
//       await sendEmail(user.email, "Your OTP Code", `Your OTP is: ${otp}`);
    } else {
//       await sendSMS(user.mobileNumber, `Your OTP is: ${otp}`);
    }

    return res.status(200).json({ message: `OTP sent successfully via ${via}` });
  } catch (err) {
    console.error("OTP Send Error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};







const forgotPassword = async (req, res) => {
  try {
    const { email, mobileNumber, countryCode, via } = req.body;

    if (!via || (via !== "email" && via !== "mobile")) {
      return res.status(400).json({ message: "Invalid 'via' method. Use 'email' or 'mobile'" });
    }

    let user;

    if (via === "email") {
      if (!email) return res.status(400).json({ message: "Email is required" });

      user = await User.findOne({ email });
      if (!user) return res.status(404).json({ message: "User not found with this email" });
    } else if (via === "mobile") {
      if (!mobileNumber || !countryCode) {
        return res.status(400).json({ message: "Mobile number and country code are required" });
      }

      user = await User.findOne({ mobileNumber, countryCode });
      if (!user) return res.status(404).json({ message: "User not found with this mobile number" });
    }

    const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: "15m" }
      );

    await user.save();

 
    const resetLink = `http://localhost:4041/api/v1/auth/reset-password?token=${token}`;

    console.log(resetLink);


    if (via === "email") {
//       await sendEmail(user.email, "Password Reset", `Reset your password: ${resetLink}`);
    } else {
//       await sendSMS(user.mobileNumber, `Reset your password: ${resetLink}`);
    }

    return res.status(200).json({ message: `Reset link sent via ${via}` });
  } catch (err) {
    console.error("Forgot Password Error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};




const resetPassword = async (req, res) => {
  try {
    const { token } = req.query;
    const { password } = req.body;

    console.log(token);

    if (!token) return res.status(400).json({ error: "Token is required" });
    if (!password || password.length < 6)
      return res.status(400).json({ error: "Password must be at least 6 characters" });

    // Verify token
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
      console.log(payload);
    } catch (err) {
        console.log(err);
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    // Find user by ID from token
    const user = await User.findById(payload.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


const verifyOtp = async (req, res) => {
        try {
          const { otp, email, mobileNumber, countryCode, type } = req.body;
      
          if (!otp || !type || !["email", "mobile"].includes(type)) {
            return res.status(400).json({ error: "OTP and valid type (email/mobile) required" });
          }
      
          let user;
          if (email) {
            user = await User.findOne({ email });
          } else if (mobileNumber && countryCode) {
            user = await User.findOne({ mobileNumber, countryCode });
          } else {
            return res.status(400).json({ error: "Email or mobileNumber with countryCode required" });
          }
      
          if (!user) return res.status(404).json({ error: "User not found" });
      
          if (type === "email") {
            if (user.emailOtp !== otp) return res.status(400).json({ error: "Invalid Email OTP" });
            if (user.emailOtpExpiry < Date.now()) return res.status(400).json({ error: "Email OTP expired" });
            user.isEmailVerified = true;
            user.emailOtp = undefined;
            user.emailOtpExpiry = undefined;
          } else if (type === "mobile") {
            if (user.mobileOtp !== otp) return res.status(400).json({ error: "Invalid Mobile OTP" });
            if (user.mobileOtpExpiry < Date.now()) return res.status(400).json({ error: "Mobile OTP expired" });
            user.isMobileVerified = true;
            user.mobileOtp = undefined;
            user.mobileOtpExpiry = undefined;
          }


          console.log("user is",user);
      
          await user.save();
      
          res.json({ message: `${type === "email" ? "Email" : "Mobile"} OTP verified successfully` });
        } catch (error) {
          console.error("Verify OTP error:", error);
          res.status(500).json({ error: "Internal Server Error" });
        }
      };
      



      const setPin = async (req, res) => {
        try {
          const authHeader = req.headers.authorization;
          if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "Authorization token missing or malformed" });
          }
      
          const token = authHeader.split(" ")[1];
          let decoded;
          try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
          } catch (err) {
            return res.status(401).json({ error: "Invalid or expired token" });
          }
      
          const userId = decoded.id; // Assuming you encoded user id as 'id' in JWT
      
          const { pin } = req.body;
          if (!pin || pin.length !== 4 || !/^\d{4}$/.test(pin)) {
            return res.status(400).json({ error: "PIN must be a 4-digit number" });
          }
      
          const user = await User.findById(userId);
          if (!user) {
            return res.status(404).json({ error: "User not found" });
          }
      
          const hashedPin = await bcrypt.hash(pin, 10);
          user.pin = hashedPin;
          await user.save();
      
          res.json({ message: "PIN set successfully" });
        } catch (error) {
          console.error("Set PIN error:", error);
          res.status(500).json({ error: "Internal Server Error" });
        }
      };
      








module.exports = { register,login,sendOrResendOtp,forgotPassword,resetPassword ,verifyOtp,setPin};

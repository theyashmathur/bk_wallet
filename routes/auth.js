const express = require("express");
const router = express.Router();
const {authMiddleware} = require('./../middleware/authMiddleware')
const { register,login,sendOrResendOtp ,forgotPassword,resetPassword,verifyOtp,setPin} = require("../controllers/authController");

router.post("/auth/register", register);
router.post("/auth/login", login);
router.post("/auth/send-otp", sendOrResendOtp);
router.post("/auth/forgot-password", forgotPassword);
router.post("/auth/reset-password", resetPassword);
router.post('/auth/verify-otp',verifyOtp);
router.post('/auth/set-pin',authMiddleware,setPin);
router.get('/auth/profile',authMiddleware,getProfile);
router.put('/auth/update-profile',authMiddleware,updateProfile);
module.exports = router;

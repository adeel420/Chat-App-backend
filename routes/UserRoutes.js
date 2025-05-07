const express = require("express");
const bcrypt = require("bcryptjs"); // Changed from bcrypt to bcryptjs
const User = require("../models/userModel");
const { sendVerificationCode, welcomeCode } = require("../middleware/email");
const { jwtAuthMiddleware, generateToken } = require("../middleware/jwt");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const router = express.Router();
const saltRounds = 10;

// router.use(express.static("public"));

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "chat-app-images", // e.g., 'chat-app-images'
    allowed_formats: ["jpg", "jpeg", "png"],
  },
});

const upload = multer({ storage });

// Signup Route
router.post("/signup", upload.single("image"), async (req, res) => {
  try {
    const name = req.body.name;
    const email = req.body.email.toLowerCase();
    const password = req.body.password;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existEmail = await User.findOne({ email });
    if (existEmail) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // HASH PASSWORD — VERY IMPORTANT
    const hashedPassword = await bcrypt.hash(password, 10);

    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    let profile = "";
    if (req.file && req.file.path) {
      profile = req.file.path; // This is the Cloudinary URL
    }

    const user = new User({
      name,
      email,
      password: password, // ✅ Must be hashedPassword
      profile,
      verificationCode,
    });

    await user.save();
    await sendVerificationCode(email, verificationCode);

    res.status(200).json({
      message: "Signup successful. Check your email for verification code",
    });
  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Login Route
router.post("/login", async (req, res) => {
  try {
    const email = req.body.email?.toLowerCase().trim();
    const password = req.body.password?.trim();
    console.log("Email:", email);
    console.log("Password:", password);

    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found");
      return res.status(400).json({ error: "Invalid email or password" });
    }

    if (!user.isVerified) {
      console.log("Email not verified");
      return res.status(400).json({ error: "Please verify your email first" });
    }

    console.log("Stored hash:", user.password);

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password match:", isMatch);

    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const token = generateToken({ id: user._id });
    res.status(200).json({
      message: "Login successful",
      token,
      user: { id: user._id, email: user.email },
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Verify Email
router.post("/verify-email", async (req, res) => {
  try {
    const { code } = req.body;
    if (!code)
      return res.status(400).json({ error: "Verification code is required" });

    const user = await User.findOne({ verificationCode: code.toString() });
    if (!user)
      return res.status(400).json({ error: "Invalid verification code" });

    user.isVerified = true;
    user.verificationCode = undefined;
    await user.save();

    await welcomeCode(user.email, user.name);
    res.status(200).json({ message: "Email verified successfully" });
  } catch (err) {
    console.error("Verification Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Forgot Password
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(400).json({ error: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    user.resetPasswordOTP = otp;
    user.resetPasswordExpires = otpExpiry;
    await user.save({ validateBeforeSave: false });

    await sendVerificationCode(email, otp);
    res.status(200).json({ message: "OTP sent to your email" });
  } catch (err) {
    console.error("Forgot Password Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Reset Password
router.put("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res
        .status(400)
        .json({ error: "Email, OTP, and new password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(400).json({ error: "User not found" });

    if (!user.resetPasswordOTP || !user.resetPasswordExpires) {
      return res.status(400).json({ error: "OTP was not requested" });
    }

    if (user.resetPasswordOTP !== otp.toString()) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    if (user.resetPasswordExpires < new Date()) {
      return res.status(400).json({ error: "OTP has expired" });
    }

    user.password = await bcrypt.hash(newPassword.trim(), saltRounds);
    user.resetPasswordOTP = undefined;
    user.resetPasswordExpires = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    console.error("Reset Password Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Authenticated User Info
router.get("/login-data", jwtAuthMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(400).json({ error: "User ID is missing" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      email: user.email,
      name: user.name,
      image: user.profile,
      id: user._id,
    });
  } catch (err) {
    console.error("Login Data Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// All user except loginUser
router.get("/all", jwtAuthMiddleware, async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const users = await User.find({ _id: { $ne: currentUserId } }).select(
      "-password"
    );
    res.status(200).json(users);
  } catch (err) {
    console.error("Login Data Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;

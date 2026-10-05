const asyncHandler = require("express-async-handler");
const crypto = require("crypto");
const User = require("../models/User");
const Caterer = require("../models/Caterer");
const generateToken = require("../utils/generateToken");

// @desc    Register new user (customer or caterer)
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, phone, password, confirmPassword, role } = req.body;

  if (!name || !email || !phone || !password) {
    res.status(400);
    throw new Error("Please provide all required fields");
  }

  if (confirmPassword && password !== confirmPassword) {
    res.status(400);
    throw new Error("Passwords do not match");
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("An account with this email already exists");
  }

  const allowedRole = ["customer", "caterer"].includes(role) ? role : "customer";

  const user = await User.create({ name, email, phone, password, role: allowedRole });

  // If registering as a caterer, create a placeholder caterer profile pending approval
  if (allowedRole === "caterer") {
    await Caterer.create({
      user: user._id,
      name: `${name}'s Catering`,
      ownerName: name,
      email,
      phone,
      location: "Not set",
      city: "Not set",
      description: "New caterer - profile not yet completed.",
      pricePerPlate: 0,
      approved: false,
    });
  }

  res.status(201).json({
    success: true,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
    token: generateToken(user._id, user.role),
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  if (user.isBlocked) {
    res.status(403);
    throw new Error("Your account has been blocked. Contact support.");
  }

  res.json({
    success: true,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
    token: generateToken(user._id, user.role),
  });
});

// @desc    Get logged-in user's profile
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user });
});

// @desc    Forgot password - generates a reset token (in production, emailed to user)
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error("No account found with this email");
  }

  const resetToken = crypto.randomBytes(20).toString("hex");
  user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes
  await user.save();

  // In production this token would be emailed via emailService.
  res.json({
    success: true,
    message: "Password reset token generated. Check your email.",
    resetToken, // exposed here only for local/dev testing
  });
});

// @desc    Reset password using token
// @route   POST /api/auth/reset-password/:token
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error("Invalid or expired reset token");
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.json({ success: true, message: "Password reset successful. Please log in." });
});

module.exports = { registerUser, loginUser, getMe, forgotPassword, resetPassword };

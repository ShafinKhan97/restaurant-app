const express = require("express");
const router = express.Router();
const {
  signup,
  verifyEmail,
  resendVerification,
  login,
  logout,
  forgotPassword,
  resetPassword,
  updateProfile,
  updatePassword,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { authLimiter } = require("../middleware/rateLimiter");

// Public routes
router.post("/signup", authLimiter, signup);
router.post("/verify-email", authLimiter, verifyEmail);
router.post("/resend-verification", authLimiter, resendVerification);
router.post("/login", authLimiter, login);
router.post("/forgot-password", authLimiter, forgotPassword);
router.post("/reset-password", authLimiter, resetPassword);

// Protected routes
router.post("/logout", protect, logout);
router.put("/profile", protect, updateProfile);
router.put("/password", protect, updatePassword);

// PUT /api/auth/admin/:id/suspend
router.put("/admin/:id/suspend", protect, authorize("super_admin"), toggleAdminSuspension);

module.exports = router;

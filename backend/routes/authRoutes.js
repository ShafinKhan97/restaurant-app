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
  logout,
  toggleAdminSuspension,
  updateProfile,
  updatePassword,
} = require("../controllers/authController");
const { protect, authorize } = require("../middleware/authMiddleware");

// Public routes
router.post("/signup", signup);
router.post("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerification);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Protected routes
router.post("/logout", protect, logout);
router.put("/profile", protect, updateProfile);
router.put("/password", protect, updatePassword);

// PUT /api/auth/admin/:id/suspend
router.put("/admin/:id/suspend", protect, authorize("super_admin"), toggleAdminSuspension);

module.exports = router;

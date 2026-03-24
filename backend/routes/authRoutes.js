const express = require("express");
const router = express.Router();
const {
  signup,
  login,
  forgotPassword,
  resetPassword,
  logout,
  toggleAdminSuspension,
} = require("../controllers/authController");
const { protect, authorize } = require("../middleware/authMiddleware");

// POST /api/auth/signup
router.post("/signup", signup);

// POST /api/auth/login
router.post("/login", login);

// POST /api/auth/forgot-password
router.post("/forgot-password", forgotPassword);

// POST /api/auth/reset-password
router.post("/reset-password", resetPassword);

// POST /api/auth/logout
router.post("/logout", logout);

// PUT /api/auth/admin/:id/suspend
router.put("/admin/:id/suspend", protect, authorize("super_admin"), toggleAdminSuspension);

module.exports = router;

const express = require("express");
const router = express.Router();
const { getMenuBySlug } = require("../controllers/menuItemController");

// @desc    Get full menu by restaurant slug (public — for QR scan)
// @route   GET /api/menu/:slug
// @access  Public
router.get("/:slug", getMenuBySlug);

module.exports = router;

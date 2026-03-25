const express = require("express");
const router = express.Router({ mergeParams: true }); // mergeParams to access :restaurantId
const { protect, authorize } = require("../middleware/authMiddleware");
const { mutationLimiter } = require("../middleware/rateLimiter");
const {
  createMenuItem,
  getMenuItems,
  getMenuItem,
  updateMenuItem,
  deleteMenuItem,
} = require("../controllers/menuItemController");

// All routes are nested under /api/restaurants/:restaurantId/menu-items
// All routes are protected — only restaurant_admin and super_admin
router.use(protect, authorize("restaurant_admin", "super_admin"));

router.route("/").post(mutationLimiter, createMenuItem).get(getMenuItems);

router.route("/:id").get(getMenuItem).put(mutationLimiter, updateMenuItem).delete(mutationLimiter, deleteMenuItem);

module.exports = router;

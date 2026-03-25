const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const { mutationLimiter } = require("../middleware/rateLimiter");
const { handleRestaurantUpload } = require("../middleware/upload");
const {
  createRestaurant,
  getMyRestaurants,
  getRestaurant,
  updateRestaurant,
  deleteRestaurant,
  getRestaurantBySlug,
  getAllRestaurants,
} = require("../controllers/restaurantController");

// Public route (must be before /:id to avoid conflict)
router.get("/slug/:slug", getRestaurantBySlug);

// Protected routes — only restaurant_admin and super_admin roles
router.post("/", protect, authorize("restaurant_admin", "super_admin"), handleRestaurantUpload, mutationLimiter, createRestaurant);
router.get("/", protect, authorize("restaurant_admin", "super_admin"), getMyRestaurants);
router.get("/all", protect, authorize("super_admin"), getAllRestaurants);
router.get("/:id", protect, authorize("restaurant_admin", "super_admin"), getRestaurant);
router.put("/:id", protect, authorize("restaurant_admin", "super_admin"), handleRestaurantUpload, mutationLimiter, updateRestaurant);
router.delete("/:id", protect, authorize("restaurant_admin", "super_admin"), mutationLimiter, deleteRestaurant);

module.exports = router;

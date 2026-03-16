const mongoose = require("mongoose");
const Restaurant = require("../models/Restaurant");

// Helper: validate MongoDB ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/**
 * Normalize empty strings to null for optional fields.
 */
const normalizeOptionalFields = (body) => {
  const fields = ["logo_url", "banner_image", "address", "contact"];
  const normalized = {};
  for (const field of fields) {
    if (body[field] !== undefined) {
      normalized[field] = body[field] === "" ? null : body[field];
    }
  }
  return normalized;
};

/**
 * Format Mongoose validation errors into a user-friendly response.
 */
const handleMongooseError = (error, res) => {
  // Mongoose validation error
  if (error.name === "ValidationError") {
    const messages = Object.values(error.errors).map((err) => err.message);
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: messages,
    });
  }

  // MongoDB duplicate key error (e.g., slug collision after retries)
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern || {})[0] || "field";
    return res.status(409).json({
      success: false,
      message: `A restaurant with this ${field} already exists. Please try a different name.`,
    });
  }

  return null; // not a known error type
};

// @desc    Create a restaurant
// @route   POST /api/restaurants
// @access  Private (restaurant_admin, super_admin)
const createRestaurant = async (req, res) => {
  try {
    const { name } = req.body;

    // Validate name (trim and check)
    const trimmedName = name ? name.trim() : "";
    if (!trimmedName || trimmedName.length < 2) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide a restaurant name (at least 2 characters after trimming)",
      });
    }

    // Check restaurant limit for this admin (per-admin, stored in DB)
    const currentCount = await Restaurant.countDocuments({
      admin_id: req.user._id,
      is_active: true,
    });

    if (currentCount >= req.user.max_restaurants) {
      return res.status(403).json({
        success: false,
        message: `You have reached your restaurant limit (${req.user.max_restaurants}). Please contact support to increase your limit.`,
      });
    }

    // Normalize optional fields
    const optionalFields = normalizeOptionalFields(req.body);

    const restaurant = await Restaurant.create({
      admin_id: req.user._id, // Always from authenticated user, never from body
      name: trimmedName,
      ...optionalFields,
    });

    res.status(201).json({
      success: true,
      restaurant,
    });
  } catch (error) {
    console.error("Create restaurant error:", error);

    const handled = handleMongooseError(error, res);
    if (handled) return;

    res.status(500).json({
      success: false,
      message: "Server error while creating restaurant",
    });
  }
};

// @desc    Get all restaurants of logged-in admin
// @route   GET /api/restaurants
// @access  Private
const getMyRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find({
      admin_id: req.user._id,
      is_active: true,
    });

    res.status(200).json({
      success: true,
      count: restaurants.length,
      restaurants,
    });
  } catch (error) {
    console.error("Get restaurants error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Get single restaurant by ID
// @route   GET /api/restaurants/:id
// @access  Private
const getRestaurant = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid restaurant ID format",
      });
    }

    const restaurant = await Restaurant.findOne({
      _id: req.params.id,
      is_active: true,
    });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    // Check ownership
    if (restaurant.admin_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this restaurant",
      });
    }

    res.status(200).json({
      success: true,
      restaurant,
    });
  } catch (error) {
    console.error("Get restaurant error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Update restaurant
// @route   PUT /api/restaurants/:id
// @access  Private
const updateRestaurant = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid restaurant ID format",
      });
    }

    let restaurant = await Restaurant.findOne({
      _id: req.params.id,
      is_active: true,
    });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    // Check ownership
    if (restaurant.admin_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this restaurant",
      });
    }

    // Validate name if being updated
    if (req.body.name !== undefined) {
      const trimmedName = req.body.name.trim();
      if (!trimmedName || trimmedName.length < 2) {
        return res.status(400).json({
          success: false,
          message:
            "Restaurant name must be at least 2 characters after trimming",
        });
      }
      restaurant.name = trimmedName;
    }

    // Normalize and apply optional fields
    const optionalFields = normalizeOptionalFields(req.body);
    for (const [key, value] of Object.entries(optionalFields)) {
      restaurant[key] = value;
    }

    await restaurant.save();

    res.status(200).json({
      success: true,
      restaurant,
    });
  } catch (error) {
    console.error("Update restaurant error:", error);

    const handled = handleMongooseError(error, res);
    if (handled) return;

    res.status(500).json({
      success: false,
      message: "Server error while updating restaurant",
    });
  }
};

// @desc    Delete restaurant (soft delete)
// @route   DELETE /api/restaurants/:id
// @access  Private
const deleteRestaurant = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid restaurant ID format",
      });
    }

    const restaurant = await Restaurant.findOne({
      _id: req.params.id,
      is_active: true,
    });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    // Check ownership
    if (restaurant.admin_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this restaurant",
      });
    }

    // Soft delete — mark as inactive
    restaurant.is_active = false;
    await restaurant.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: "Restaurant deleted successfully",
    });
  } catch (error) {
    console.error("Delete restaurant error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting restaurant",
    });
  }
};

// @desc    Get restaurant by slug (public - for QR scan)
// @route   GET /api/restaurants/slug/:slug
// @access  Public
const getRestaurantBySlug = async (req, res) => {
  try {
    // First try active restaurant by current slug
    let restaurant = await Restaurant.findOne({
      slug: req.params.slug,
      is_active: true,
    });

    // If not found, check previous_slugs for redirect support
    if (!restaurant) {
      restaurant = await Restaurant.findOne({
        previous_slugs: req.params.slug,
        is_active: true,
      });

      if (restaurant) {
        // Return the restaurant with a redirect hint
        return res.status(200).json({
          success: true,
          redirected: true,
          current_slug: restaurant.slug,
          restaurant,
        });
      }
    }

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    res.status(200).json({
      success: true,
      restaurant,
    });
  } catch (error) {
    console.error("Get restaurant by slug error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Get ALL restaurants across the platform
// @route   GET /api/restaurants/all
// @access  Private (super_admin)
const getAllRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find({})
      .populate("admin_id", "name email role")
      .sort("-created_at");

    // Also get item counts
    const MenuItem = require("../models/MenuItem");
    const restaurantsWithCounts = await Promise.all(
      restaurants.map(async (r) => {
        const itemCount = await MenuItem.countDocuments({ restaurant_id: r._id });
        return {
          ...r.toObject(),
          items: itemCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: restaurantsWithCounts.length,
      restaurants: restaurantsWithCounts,
    });
  } catch (error) {
    console.error("Get all restaurants error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  createRestaurant,
  getMyRestaurants,
  getRestaurant,
  updateRestaurant,
  deleteRestaurant,
  getRestaurantBySlug,
  getAllRestaurants,
};

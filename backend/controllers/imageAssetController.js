const mongoose = require("mongoose");
const ImageAsset = require("../models/ImageAsset");
const MenuItem = require("../models/MenuItem");
const Restaurant = require("../models/Restaurant");

// Helper: validate MongoDB ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/**
 * Format Mongoose validation errors into a user-friendly response.
 */
const handleMongooseError = (error, res) => {
  if (error.name === "ValidationError") {
    const messages = Object.values(error.errors).map((err) => err.message);
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: messages,
    });
  }

  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern || {})[0] || "field";
    return res.status(409).json({
      success: false,
      message: `Duplicate value for ${field}.`,
    });
  }

  return null;
};

/**
 * Verify restaurant exists, is active, and belongs to req.user.
 * Returns the restaurant or sends an error response.
 */
const verifyRestaurantOwnership = async (restaurantId, req, res) => {
  if (!isValidObjectId(restaurantId)) {
    res.status(400).json({
      success: false,
      message: "Invalid restaurant ID format",
    });
    return null;
  }

  const restaurant = await Restaurant.findOne({
    _id: restaurantId,
    is_active: true,
  });

  if (!restaurant) {
    res.status(404).json({
      success: false,
      message: "Restaurant not found",
    });
    return null;
  }

  if (restaurant.admin_id.toString() !== req.user._id.toString()) {
    res.status(403).json({
      success: false,
      message: "Not authorized to manage this restaurant's image assets",
    });
    return null;
  }

  return restaurant;
};

/**
 * Verify menu item exists and belongs to the restaurant.
 * Returns the menu item or sends an error response.
 */
const verifyMenuItemOwnership = async (menuItemId, restaurantId, res) => {
  if (!isValidObjectId(menuItemId)) {
    res.status(400).json({
      success: false,
      message: "Invalid menu item ID format",
    });
    return null;
  }

  const menuItem = await MenuItem.findOne({
    _id: menuItemId,
    restaurant_id: restaurantId,
  });

  if (!menuItem) {
    res.status(404).json({
      success: false,
      message: "Menu item not found in this restaurant",
    });
    return null;
  }

  return menuItem;
};

// @desc    Create an image asset for a menu item
// @route   POST /api/restaurants/:restaurantId/menu-items/:menuItemId/image-assets
// @access  Private (restaurant_admin, super_admin)
const createImageAsset = async (req, res) => {
  try {
    const restaurant = await verifyRestaurantOwnership(
      req.params.restaurantId,
      req,
      res
    );
    if (!restaurant) return;

    const menuItem = await verifyMenuItemOwnership(
      req.params.menuItemId,
      req.params.restaurantId,
      res
    );
    if (!menuItem) return;

    const { original_url, enhanced_url, ai_processed } = req.body;

    // Validate original_url
    if (!original_url || !original_url.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please provide an original image URL",
      });
    }

    const imageAsset = await ImageAsset.create({
      menu_id: req.params.menuItemId,
      original_url: original_url.trim(),
      enhanced_url: enhanced_url || null,
      ai_processed: ai_processed || false,
    });

    res.status(201).json({
      success: true,
      imageAsset,
    });
  } catch (error) {
    console.error("Create image asset error:", error);

    const handled = handleMongooseError(error, res);
    if (handled) return;

    res.status(500).json({
      success: false,
      message: "Server error while creating image asset",
    });
  }
};

// @desc    Get all image assets for a menu item
// @route   GET /api/restaurants/:restaurantId/menu-items/:menuItemId/image-assets
// @access  Private (restaurant_admin, super_admin)
const getImageAssets = async (req, res) => {
  try {
    const restaurant = await verifyRestaurantOwnership(
      req.params.restaurantId,
      req,
      res
    );
    if (!restaurant) return;

    const menuItem = await verifyMenuItemOwnership(
      req.params.menuItemId,
      req.params.restaurantId,
      res
    );
    if (!menuItem) return;

    const imageAssets = await ImageAsset.find({
      menu_id: req.params.menuItemId,
    }).sort({ created_at: -1 });

    res.status(200).json({
      success: true,
      count: imageAssets.length,
      imageAssets,
    });
  } catch (error) {
    console.error("Get image assets error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Get single image asset
// @route   GET /api/restaurants/:restaurantId/menu-items/:menuItemId/image-assets/:imageId
// @access  Private (restaurant_admin, super_admin)
const getImageAsset = async (req, res) => {
  try {
    const restaurant = await verifyRestaurantOwnership(
      req.params.restaurantId,
      req,
      res
    );
    if (!restaurant) return;

    const menuItem = await verifyMenuItemOwnership(
      req.params.menuItemId,
      req.params.restaurantId,
      res
    );
    if (!menuItem) return;

    if (!isValidObjectId(req.params.imageId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid image asset ID format",
      });
    }

    const imageAsset = await ImageAsset.findOne({
      _id: req.params.imageId,
      menu_id: req.params.menuItemId,
    });

    if (!imageAsset) {
      return res.status(404).json({
        success: false,
        message: "Image asset not found",
      });
    }

    res.status(200).json({
      success: true,
      imageAsset,
    });
  } catch (error) {
    console.error("Get image asset error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Update image asset
// @route   PUT /api/restaurants/:restaurantId/menu-items/:menuItemId/image-assets/:imageId
// @access  Private (restaurant_admin, super_admin)
const updateImageAsset = async (req, res) => {
  try {
    const restaurant = await verifyRestaurantOwnership(
      req.params.restaurantId,
      req,
      res
    );
    if (!restaurant) return;

    const menuItem = await verifyMenuItemOwnership(
      req.params.menuItemId,
      req.params.restaurantId,
      res
    );
    if (!menuItem) return;

    if (!isValidObjectId(req.params.imageId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid image asset ID format",
      });
    }

    const imageAsset = await ImageAsset.findOne({
      _id: req.params.imageId,
      menu_id: req.params.menuItemId,
    });

    if (!imageAsset) {
      return res.status(404).json({
        success: false,
        message: "Image asset not found",
      });
    }

    // Update original_url if provided
    if (req.body.original_url !== undefined) {
      const trimmedUrl = req.body.original_url.trim();
      if (!trimmedUrl) {
        return res.status(400).json({
          success: false,
          message: "Original image URL cannot be empty",
        });
      }
      imageAsset.original_url = trimmedUrl;
    }

    // Update enhanced_url if provided
    if (req.body.enhanced_url !== undefined) {
      imageAsset.enhanced_url =
        req.body.enhanced_url === "" ? null : req.body.enhanced_url;
    }

    // Update ai_processed if provided
    if (req.body.ai_processed !== undefined) {
      imageAsset.ai_processed = req.body.ai_processed;
    }

    await imageAsset.save();

    res.status(200).json({
      success: true,
      imageAsset,
    });
  } catch (error) {
    console.error("Update image asset error:", error);

    const handled = handleMongooseError(error, res);
    if (handled) return;

    res.status(500).json({
      success: false,
      message: "Server error while updating image asset",
    });
  }
};

// @desc    Delete image asset
// @route   DELETE /api/restaurants/:restaurantId/menu-items/:menuItemId/image-assets/:imageId
// @access  Private (restaurant_admin, super_admin)
const deleteImageAsset = async (req, res) => {
  try {
    const restaurant = await verifyRestaurantOwnership(
      req.params.restaurantId,
      req,
      res
    );
    if (!restaurant) return;

    const menuItem = await verifyMenuItemOwnership(
      req.params.menuItemId,
      req.params.restaurantId,
      res
    );
    if (!menuItem) return;

    if (!isValidObjectId(req.params.imageId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid image asset ID format",
      });
    }

    const imageAsset = await ImageAsset.findOne({
      _id: req.params.imageId,
      menu_id: req.params.menuItemId,
    });

    if (!imageAsset) {
      return res.status(404).json({
        success: false,
        message: "Image asset not found",
      });
    }

    await imageAsset.deleteOne();

    res.status(200).json({
      success: true,
      message: "Image asset deleted successfully",
    });
  } catch (error) {
    console.error("Delete image asset error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting image asset",
    });
  }
};

module.exports = {
  createImageAsset,
  getImageAssets,
  getImageAsset,
  updateImageAsset,
  deleteImageAsset,
};

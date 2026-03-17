const mongoose = require("mongoose");
const { DeleteObjectCommand } = require("@aws-sdk/client-s3");
const ImageAsset = require("../models/ImageAsset");
const MenuItem = require("../models/MenuItem");
const Restaurant = require("../models/Restaurant");
const { s3Client, bucketName } = require("../config/s3");

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
 * Delete an object from S3 by its key.
 */
const deleteS3Object = async (key) => {
  if (!key) return;
  try {
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: key,
      })
    );
  } catch (error) {
    console.error("S3 delete error:", error);
  }
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

// @desc    Create an image asset for a menu item (file upload to S3)
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

    // Multer processes the file — check if a file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload an image file (field name: 'image')",
      });
    }

    const imageAsset = await ImageAsset.create({
      menu_id: req.params.menuItemId,
      original_url: req.file.location, // S3 public URL
      s3_key: req.file.key, // S3 object key for deletion
      ai_processed: req.body.ai_processed || false,
      status: req.body.status || "pending",
    });

    res.status(201).json({
      success: true,
      imageAsset,
    });
  } catch (error) {
    console.error("Create image asset error:", error);

    // If file was uploaded to S3 but DB save failed, clean up S3
    if (req.file && req.file.key) {
      await deleteS3Object(req.file.key);
    }

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

// @desc    Update image asset (replace image file on S3)
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

    // If a new file was uploaded, replace the old one on S3
    if (req.file) {
      // Delete old S3 object
      await deleteS3Object(imageAsset.s3_key);

      // Update with new S3 URL and key
      imageAsset.original_url = req.file.location;
      imageAsset.s3_key = req.file.key;
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

    // Update status if provided
    if (req.body.status !== undefined) {
      imageAsset.status = req.body.status;
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

// @desc    Delete image asset (also deletes from S3)
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

    // Delete file from S3 first
    await deleteS3Object(imageAsset.s3_key);

    // Then delete DB record
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

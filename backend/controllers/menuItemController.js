const mongoose = require("mongoose");
const MenuItem = require("../models/MenuItem");
const Restaurant = require("../models/Restaurant");

// Helper: validate MongoDB ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/**
 * Normalize empty strings to null for optional fields.
 */
const normalizeOptionalFields = (body) => {
  const fields = ["description"];
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
      message: `A menu item with this ${field} already exists.`,
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
      message: "Not authorized to manage this restaurant's menu",
    });
    return null;
  }

  return restaurant;
};

// @desc    Create a menu item
// @route   POST /api/restaurants/:restaurantId/menu-items
// @access  Private (restaurant_admin, super_admin)
const createMenuItem = async (req, res) => {
  try {
    const restaurant = await verifyRestaurantOwnership(
      req.params.restaurantId,
      req,
      res
    );
    if (!restaurant) return;

    const {
      name,
      description,
      discount_type,
      category_name,
      discount_value,
      price,
      variant,
      availability,
    } = req.body;

    // Validate name
    const trimmedName = name ? name.trim() : "";
    if (!trimmedName || trimmedName.length < 2) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide a menu item name (at least 2 characters after trimming)",
      });
    }

    // Validate category_name
    const trimmedCategory = category_name ? category_name.trim() : "";
    if (!trimmedCategory) {
      return res.status(400).json({
        success: false,
        message: "Please provide a category name",
      });
    }

    // Normalize optional fields
    const optionalFields = normalizeOptionalFields(req.body);

    const menuItem = await MenuItem.create({
      restaurant_id: req.params.restaurantId,
      name: trimmedName,
      category_name: trimmedCategory,
      discount_type: discount_type || "none",
      discount_value: discount_value || 0,
      price,
      variant: variant || [],
      availability: availability || "available",
      ...optionalFields,
    });

    res.status(201).json({
      success: true,
      menuItem,
    });
  } catch (error) {
    console.error("Create menu item error:", error);

    const handled = handleMongooseError(error, res);
    if (handled) return;

    res.status(500).json({
      success: false,
      message: "Server error while creating menu item",
    });
  }
};

// @desc    Get all menu items for a restaurant
// @route   GET /api/restaurants/:restaurantId/menu-items
// @access  Private (restaurant_admin, super_admin)
const getMenuItems = async (req, res) => {
  try {
    const restaurant = await verifyRestaurantOwnership(
      req.params.restaurantId,
      req,
      res
    );
    if (!restaurant) return;

    // Support optional filtering by category and availability
    const filter = { restaurant_id: req.params.restaurantId };

    if (req.query.category) {
      filter.category_name = req.query.category;
    }
    if (req.query.availability) {
      filter.availability = req.query.availability;
    }

    const menuItems = await MenuItem.find(filter).sort({
      category_name: 1,
      name: 1,
    });

    res.status(200).json({
      success: true,
      count: menuItems.length,
      menuItems,
    });
  } catch (error) {
    console.error("Get menu items error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Get single menu item
// @route   GET /api/restaurants/:restaurantId/menu-items/:id
// @access  Private (restaurant_admin, super_admin)
const getMenuItem = async (req, res) => {
  try {
    const restaurant = await verifyRestaurantOwnership(
      req.params.restaurantId,
      req,
      res
    );
    if (!restaurant) return;

    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid menu item ID format",
      });
    }

    const menuItem = await MenuItem.findOne({
      _id: req.params.id,
      restaurant_id: req.params.restaurantId,
    });

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: "Menu item not found",
      });
    }

    res.status(200).json({
      success: true,
      menuItem,
    });
  } catch (error) {
    console.error("Get menu item error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Update menu item
// @route   PUT /api/restaurants/:restaurantId/menu-items/:id
// @access  Private (restaurant_admin, super_admin)
const updateMenuItem = async (req, res) => {
  try {
    const restaurant = await verifyRestaurantOwnership(
      req.params.restaurantId,
      req,
      res
    );
    if (!restaurant) return;

    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid menu item ID format",
      });
    }

    const menuItem = await MenuItem.findOne({
      _id: req.params.id,
      restaurant_id: req.params.restaurantId,
    });

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: "Menu item not found",
      });
    }

    // Validate name if being updated
    if (req.body.name !== undefined) {
      const trimmedName = req.body.name.trim();
      if (!trimmedName || trimmedName.length < 2) {
        return res.status(400).json({
          success: false,
          message:
            "Menu item name must be at least 2 characters after trimming",
        });
      }
      menuItem.name = trimmedName;
    }

    // Validate category_name if being updated
    if (req.body.category_name !== undefined) {
      const trimmedCategory = req.body.category_name.trim();
      if (!trimmedCategory) {
        return res.status(400).json({
          success: false,
          message: "Category name cannot be empty",
        });
      }
      menuItem.category_name = trimmedCategory;
    }

    // Update other fields
    const directFields = [
      "discount_type",
      "discount_value",
      "price",
      "variant",
      "availability",
    ];
    for (const field of directFields) {
      if (req.body[field] !== undefined) {
        menuItem[field] = req.body[field];
      }
    }

    // Normalize optional fields
    const optionalFields = normalizeOptionalFields(req.body);
    for (const [key, value] of Object.entries(optionalFields)) {
      menuItem[key] = value;
    }

    await menuItem.save();

    res.status(200).json({
      success: true,
      menuItem,
    });
  } catch (error) {
    console.error("Update menu item error:", error);

    const handled = handleMongooseError(error, res);
    if (handled) return;

    res.status(500).json({
      success: false,
      message: "Server error while updating menu item",
    });
  }
};

// @desc    Delete menu item
// @route   DELETE /api/restaurants/:restaurantId/menu-items/:id
// @access  Private (restaurant_admin, super_admin)
const deleteMenuItem = async (req, res) => {
  try {
    const restaurant = await verifyRestaurantOwnership(
      req.params.restaurantId,
      req,
      res
    );
    if (!restaurant) return;

    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid menu item ID format",
      });
    }

    const menuItem = await MenuItem.findOne({
      _id: req.params.id,
      restaurant_id: req.params.restaurantId,
    });

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: "Menu item not found",
      });
    }

    await menuItem.deleteOne();

    res.status(200).json({
      success: true,
      message: "Menu item deleted successfully",
    });
  } catch (error) {
    console.error("Delete menu item error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting menu item",
    });
  }
};

// @desc    Get full menu by restaurant slug (public — for QR scan)
// @route   GET /api/menu/:slug
// @access  Public
const getMenuBySlug = async (req, res) => {
  try {
    // Find restaurant by current slug or previous slugs
    let restaurant = await Restaurant.findOne({
      slug: req.params.slug,
      is_active: true,
    });

    let redirected = false;

    if (!restaurant) {
      restaurant = await Restaurant.findOne({
        previous_slugs: req.params.slug,
        is_active: true,
      });
      if (restaurant) redirected = true;
    }

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    // Get all available menu items, grouped by category
    const menuItems = await MenuItem.find({
      restaurant_id: restaurant._id,
      availability: "available",
    }).sort({ category_name: 1, name: 1 });

    // Group items by category
    const menu = {};
    for (const item of menuItems) {
      if (!menu[item.category_name]) {
        menu[item.category_name] = [];
      }
      menu[item.category_name].push(item);
    }

    const response = {
      success: true,
      restaurant: {
        name: restaurant.name,
        slug: restaurant.slug,
        logo_url: restaurant.logo_url,
        banner_image: restaurant.banner_image,
        address: restaurant.address,
        contact: restaurant.contact,
      },
      menu,
    };

    if (redirected) {
      response.redirected = true;
      response.current_slug = restaurant.slug;
    }

    res.status(200).json(response);
  } catch (error) {
    console.error("Get menu by slug error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  createMenuItem,
  getMenuItems,
  getMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getMenuBySlug,
};

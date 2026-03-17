const mongoose = require("mongoose");

const variantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Variant name is required"],
      trim: true,
      maxlength: [100, "Variant name cannot exceed 100 characters"],
    },
    price: {
      type: Number,
      required: [true, "Variant price is required"],
      min: [0.01, "Variant price must be at least 0.01"],
    },
  },
  { _id: false }
);

const menuItemSchema = new mongoose.Schema(
  {
    restaurant_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: [true, "Restaurant ID is required"],
    },
    name: {
      type: String,
      required: [true, "Please provide a menu item name"],
      trim: true,
      minlength: [2, "Menu item name must be at least 2 characters"],
      maxlength: [100, "Menu item name cannot exceed 100 characters"],
      validate: {
        validator: function (v) {
          return v && v.trim().length >= 2;
        },
        message: "Menu item name must contain at least 2 non-whitespace characters",
      },
    },
    description: {
      type: String,
      default: null,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
      set: (v) => (typeof v === "string" && v.trim() === "" ? null : v),
    },
    image_url: {
      type: String,
      default: null, // Supports base64 or links
    },
    discount_type: {
      type: String,
      enum: {
        values: ["none", "percentage", "fixed"],
        message: "Discount type must be 'none', 'percentage', or 'fixed'",
      },
      default: "none",
    },
    category_name: {
      type: String,
      required: [true, "Please provide a category name"],
      trim: true,
      minlength: [2, "Category name must be at least 2 characters"],
      maxlength: [100, "Category name cannot exceed 100 characters"],
      validate: {
        validator: function (v) {
          return v && v.trim().length >= 2;
        },
        message: "Category name must contain at least 2 non-whitespace characters",
      },
    },
    discount_value: {
      type: Number,
      default: 0,
      min: [0, "Discount value cannot be negative"],
    },
    price: {
      type: Number,
      required: [true, "Please provide a price"],
      min: [0.01, "Price must be at least 0.01"],
    },
    variant: {
      type: [variantSchema],
      default: [],
    },
    availability: {
      type: String,
      enum: {
        values: ["available", "unavailable"],
        message: "Availability must be 'available' or 'unavailable'",
      },
      default: "available",
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

// Compound indexes
menuItemSchema.index({ restaurant_id: 1, category_name: 1 });
menuItemSchema.index({ restaurant_id: 1, name: 1 }, { unique: true });

// Async existence validator
const validateRestaurantExists = async (restaurantId) => {
  const Restaurant = mongoose.model("Restaurant");
  const exists = await Restaurant.exists({ _id: restaurantId });
  if (!exists) {
    throw new Error(`Restaurant with ID ${restaurantId} does not exist.`);
  }
};

// Check bounds on variants relative to base price manually
const validateVariants = (variants) => {
  if (variants && Array.isArray(variants)) {
    for (const v of variants) {
      if (v.price < 0.01) {
        throw new Error("Variant price must be at least 0.01");
      }
    }
  }
};

const validateDiscountLogic = (type, value) => {
  if (type === "none" && value > 0) {
    throw new Error("Contradictory state: discount_type is 'none' but discount_value is greater than 0");
  }
  if (type !== "none" && value <= 0) {
    throw new Error("Discount value must be greater than 0 when a discount type is set");
  }
  if (type === "percentage" && value > 100) {
    throw new Error("Percentage discount cannot exceed 100%");
  }
};

// Pre-save hook
menuItemSchema.pre("save", async function (next) {
  try {
    validateDiscountLogic(this.discount_type, this.discount_value);
    validateVariants(this.variant);

    if (this.isModified("restaurant_id") || this.isNew) {
      await validateRestaurantExists(this.restaurant_id);
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-update hooks (findOneAndUpdate, updateOne)
menuItemSchema.pre(["findOneAndUpdate", "updateOne"], async function (next) {
  try {
    const update = this.getUpdate();
    const docToUpdate = await this.model.findOne(this.getQuery());
    if (!docToUpdate) return next();

    const mergedDiscountType = update.$set?.discount_type !== undefined 
      ? update.$set.discount_type 
      : update.discount_type !== undefined ? update.discount_type : docToUpdate.discount_type;

    const mergedDiscountValue = update.$set?.discount_value !== undefined 
      ? update.$set.discount_value 
      : update.discount_value !== undefined ? update.discount_value : docToUpdate.discount_value;

    validateDiscountLogic(mergedDiscountType, mergedDiscountValue);

    const variants = update.$set?.variant || update.variant;
    if (variants) {
      validateVariants(variants);
    }

    const checkRestaurantId = update.$set?.restaurant_id || update.restaurant_id;
    if (checkRestaurantId && checkRestaurantId.toString() !== docToUpdate.restaurant_id.toString()) {
      await validateRestaurantExists(checkRestaurantId);
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// Cascade delete: remove all image assets
// Handles instance.deleteOne()
menuItemSchema.pre("deleteOne", { document: true, query: false }, async function () {
  const ImageAsset = mongoose.model("ImageAsset");
  await ImageAsset.deleteMany({ menu_id: this._id });
});

// Handles Model.deleteOne(), Model.findOneAndDelete()
menuItemSchema.pre(["deleteOne", "findOneAndDelete"], { document: false, query: true }, async function () {
  const doc = await this.model.findOne(this.getQuery());
  if (doc) {
    const ImageAsset = mongoose.model("ImageAsset");
    await ImageAsset.deleteMany({ menu_id: doc._id });
  }
});

// Handles Model.deleteMany()
menuItemSchema.pre("deleteMany", { document: false, query: true }, async function () {
  const docs = await this.model.find(this.getQuery());
  if (docs.length > 0) {
    const ImageAsset = mongoose.model("ImageAsset");
    const docIds = docs.map((d) => d._id);
    await ImageAsset.deleteMany({ menu_id: { $in: docIds } });
  }
});

const MenuItem = mongoose.model("MenuItem", menuItemSchema);

module.exports = MenuItem;

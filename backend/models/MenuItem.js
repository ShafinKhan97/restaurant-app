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
      min: [0, "Variant price cannot be negative"],
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
      set: (v) => (v === "" ? null : v),
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
      maxlength: [100, "Category name cannot exceed 100 characters"],
    },
    discount_value: {
      type: Number,
      default: 0,
      min: [0, "Discount value cannot be negative"],
      validate: {
        validator: function (v) {
          // If discount_type is percentage, value must be <= 100
          if (this.discount_type === "percentage" && v > 100) {
            return false;
          }
          // If discount_type is not 'none', value must be > 0
          if (this.discount_type !== "none" && v <= 0) {
            return false;
          }
          return true;
        },
        message: function (props) {
          if (this.discount_type === "percentage" && props.value > 100) {
            return "Percentage discount cannot exceed 100%";
          }
          return "Discount value must be greater than 0 when a discount type is set";
        },
      },
    },
    price: {
      type: Number,
      required: [true, "Please provide a price"],
      min: [0, "Price cannot be negative"],
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

// Compound index for quick lookups
menuItemSchema.index({ restaurant_id: 1, category_name: 1 });

// Cascade delete: remove all image assets when a menu item is deleted
menuItemSchema.pre("deleteOne", { document: true, query: false }, async function () {
  const ImageAsset = mongoose.model("ImageAsset");
  await ImageAsset.deleteMany({ menu_id: this._id });
});

const MenuItem = mongoose.model("MenuItem", menuItemSchema);

module.exports = MenuItem;

const mongoose = require("mongoose");

const imageAssetSchema = new mongoose.Schema(
  {
    menu_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MenuItem",
      required: [true, "Menu item ID is required"],
    },
    original_url: {
      type: String,
      required: [true, "Original image URL is required"],
      trim: true,
      validate: {
        validator: function (v) {
          try {
            new URL(v);
            return true;
          } catch (err) {
            return false;
          }
        },
        message: "Original image URL must be a valid URL",
      },
    },
    enhanced_url: {
      type: String,
      default: null,
      set: (v) => (typeof v === "string" && v.trim() === "" ? null : v),
    },
    s3_key: {
      type: String,
      default: null,
      sparse: true,
      unique: true,
    },
    ai_processed: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "processing", "done", "failed"],
        message: "Status must be 'pending', 'processing', 'done', or 'failed'",
      },
      default: "pending",
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

// Index for quick lookups by menu item
imageAssetSchema.index({ menu_id: 1 });

// Pre-save hook for app-level validation
imageAssetSchema.pre("save", async function (next) {
  // Validation: ai_processed true requires enhanced_url
  if (this.ai_processed && !this.enhanced_url) {
    return next(
      new Error(
        "Invalid state: Cannot be marked as ai_processed if enhanced_url is null or empty"
      )
    );
  }

  // Validation: Ref integrity check for MenuItem
  if (this.isModified("menu_id") || this.isNew) {
    const MenuItem = mongoose.model("MenuItem");
    const menuItemExists = await MenuItem.exists({ _id: this.menu_id });
    if (!menuItemExists) {
      return next(new Error(`MenuItem with ID ${this.menu_id} does not exist.`));
    }
  }

  next();
});

const ImageAsset = mongoose.model("ImageAsset", imageAssetSchema);

module.exports = ImageAsset;

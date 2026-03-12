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
    },
    enhanced_url: {
      type: String,
      default: null,
      set: (v) => (v === "" ? null : v),
    },
    ai_processed: {
      type: Boolean,
      default: false,
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

const ImageAsset = mongoose.model("ImageAsset", imageAssetSchema);

module.exports = ImageAsset;

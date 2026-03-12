const mongoose = require("mongoose");
const crypto = require("crypto");

const restaurantSchema = new mongoose.Schema(
  {
    admin_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: [true, "Admin ID is required"],
    },
    name: {
      type: String,
      required: [true, "Please provide a restaurant name"],
      trim: true,
      minlength: [2, "Restaurant name must be at least 2 characters"],
      maxlength: [100, "Restaurant name cannot exceed 100 characters"],
      validate: {
        validator: function (v) {
          // After trim, must not be empty
          return v && v.trim().length >= 2;
        },
        message: "Restaurant name must contain at least 2 non-whitespace characters",
      },
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      maxlength: [150, "Slug cannot exceed 150 characters"],
    },
    previous_slugs: {
      type: [String],
      default: [],
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    logo_url: {
      type: String,
      default: null,
      set: (v) => (v === "" ? null : v),
      validate: {
        validator: function (v) {
          if (v === null || v === undefined) return true;
          return /^https?:\/\/.+/i.test(v);
        },
        message: "Logo URL must be a valid HTTP/HTTPS URL",
      },
    },
    banner_image: {
      type: String,
      default: null,
      set: (v) => (v === "" ? null : v),
      validate: {
        validator: function (v) {
          if (v === null || v === undefined) return true;
          return /^https?:\/\/.+/i.test(v);
        },
        message: "Banner image must be a valid HTTP/HTTPS URL",
      },
    },
    address: {
      type: String,
      default: null,
      maxlength: [500, "Address cannot exceed 500 characters"],
      set: (v) => (v === "" ? null : v),
    },
    contact: {
      type: String,
      default: null,
      set: (v) => (v === "" ? null : v),
      validate: {
        validator: function (v) {
          if (v === null || v === undefined) return true;
          // Allow digits, spaces, +, -, (), dots — 7 to 20 chars
          return /^[\d\s+\-().]{7,20}$/.test(v);
        },
        message:
          "Contact must be a valid phone number (7-20 characters, digits, spaces, +, -, ())",
      },
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

/**
 * Generate a URL-safe slug from a string.
 * Handles unicode by replacing non-Latin chars with hyphens.
 * Returns empty string if nothing is left after processing.
 */
function generateSlugString(name) {
  let slug = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip diacritics
    .replace(/[^\w\s-]/g, "-") // non-word chars (including unicode) to hyphens
    .replace(/\s+/g, "-") // spaces to hyphens
    .replace(/-+/g, "-") // collapse multiple hyphens
    .replace(/^-+|-+$/g, ""); // trim leading/trailing hyphens

  // Truncate slug to a reasonable length
  if (slug.length > 100) {
    slug = slug.substring(0, 100).replace(/-+$/g, "");
  }

  return slug;
}

/**
 * Generate a cryptographically random suffix for slug deduplication.
 */
function randomSuffix() {
  return crypto.randomBytes(3).toString("hex"); // 6 hex chars
}

// Auto-generate slug from name before saving
restaurantSchema.pre("save", async function () {
  if (!this.isModified("name")) {
    return;
  }

  // If this is an update (not new) and slug is changing, save the old slug
  if (!this.isNew && this.slug) {
    if (!this.previous_slugs.includes(this.slug)) {
      this.previous_slugs.push(this.slug);
      // Cap at 5 previous slugs — remove oldest
      if (this.previous_slugs.length > 5) {
        this.previous_slugs = this.previous_slugs.slice(-5);
      }
    }
  }

  let slug = generateSlugString(this.name);

  // If slug is empty (all special chars / unicode-only name), use a fallback
  if (!slug) {
    slug = `restaurant-${randomSuffix()}`;
  }

  // Retry loop for slug collision (up to 5 attempts)
  const RestaurantModel = mongoose.model("Restaurant");
  let finalSlug = slug;
  let attempts = 0;
  const MAX_ATTEMPTS = 5;

  while (attempts < MAX_ATTEMPTS) {
    const existing = await RestaurantModel.findOne({
      slug: finalSlug,
      _id: { $ne: this._id },
    });

    if (!existing) {
      break; // unique slug found
    }

    // Collision — append random suffix and retry
    finalSlug = `${slug}-${randomSuffix()}`;
    attempts++;
  }

  if (attempts >= MAX_ATTEMPTS) {
    // Extremely unlikely, but use a full random slug as last resort
    finalSlug = `restaurant-${crypto.randomBytes(8).toString("hex")}`;
  }

  this.slug = finalSlug;
});

const Restaurant = mongoose.model("Restaurant", restaurantSchema);

module.exports = Restaurant;

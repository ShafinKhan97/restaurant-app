const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const adminSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    last_name: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: ["super_admin", "restaurant_admin"],
      default: "restaurant_admin",
    },
    max_restaurants: {
      type: Number,
      default: 10,
      min: 1,
    },
    is_verified: {
      type: Boolean,
      default: false,
    },
    verification_pin: {
      type: String,
      default: null,
    },
    verification_pin_expires_at: {
      type: Date,
      default: null,
    },
    current_token: {
      type: String,
      default: null,
      select: false,
    },
    is_suspended: {
      type: Boolean,
      default: false,
    },
    reset_pin: {
      type: String,
      default: null,
    },
    reset_pin_expires_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

// Hash password before saving
adminSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare entered password with hashed password
adminSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// Generate 6-digit email verification PIN
adminSchema.methods.generateVerificationPin = function () {
  const pin = crypto.randomInt(100000, 999999).toString();

  this.verification_pin = crypto.createHash("sha256").update(pin).digest("hex");
  this.verification_pin_expires_at = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  return pin;
};

// Generate 6-digit reset PIN
adminSchema.methods.generateResetPin = function () {
  const pin = crypto.randomInt(100000, 999999).toString();

  this.reset_pin = crypto.createHash("sha256").update(pin).digest("hex");
  this.reset_pin_expires_at = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  return pin;
};

module.exports = mongoose.model("Admin", adminSchema);

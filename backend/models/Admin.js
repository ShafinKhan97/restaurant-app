const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const validator = require("validator");

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a name"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: validator.isEmail,
        message: "Please provide a valid email",
      },
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
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
      default: 3,
      min: [1, "Max restaurants must be at least 1"],
      max: [50, "Max restaurants cannot exceed 50"],
    },
    reset_pin: {
      type: String,
      default: null,
    },
    reset_pin_expires_at: {
      type: Date,
      default: null,
    },
    reset_pin_attempts: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

// Pre-validation and save hooks
adminSchema.pre("save", async function () {
  // Clear expired pins
  if (this.reset_pin_expires_at && this.reset_pin_expires_at < new Date()) {
    this.reset_pin = null;
    this.reset_pin_expires_at = null;
    this.reset_pin_attempts = 0;
  }

  // Hash password before saving
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
});

// Update hooks for password validation
adminSchema.pre(["findOneAndUpdate", "updateOne"], async function (next) {
  const update = this.getUpdate();

  // Validate password length manually on update
  if (update.$set && update.$set.password) {
    if (update.$set.password.length < 8) {
      return next(new Error("Password must be at least 8 characters"));
    }
    const salt = await bcrypt.genSalt(10);
    update.$set.password = await bcrypt.hash(update.$set.password, salt);
  } else if (update.password) {
    if (update.password.length < 8) {
      return next(new Error("Password must be at least 8 characters"));
    }
    const salt = await bcrypt.genSalt(10);
    update.password = await bcrypt.hash(update.password, salt);
  }

  next();
});

// Compare entered password with hashed password
adminSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and save 6-digit reset PIN using await
adminSchema.methods.generateResetPin = async function () {
  // Generate random 6-digit PIN string
  const pin = crypto.randomInt(100000, 999999).toString();

  // Hash PIN before storing in DB - using bcrypt instead of sha256
  const salt = await bcrypt.genSalt(10);
  this.reset_pin = await bcrypt.hash(pin, salt);
  this.reset_pin_expires_at = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  this.reset_pin_attempts = 0;

  await this.save();

  // Return plain PIN to send via email
  return pin;
};

// Verify the PIN
adminSchema.methods.verifyResetPin = async function (enteredPin) {
  if (!this.reset_pin || !this.reset_pin_expires_at) return false;
  if (this.reset_pin_expires_at < new Date()) {
    this.reset_pin = null;
    this.reset_pin_expires_at = null;
    this.reset_pin_attempts = 0;
    await this.save();
    return false;
  }
  
  if (this.reset_pin_attempts >= 5) { // 5 max attempts
    this.reset_pin = null;
    this.reset_pin_expires_at = null;
    this.reset_pin_attempts = 0;
    await this.save();
    return false;
  }

  const isMatch = await bcrypt.compare(enteredPin, this.reset_pin);
  if (!isMatch) {
    this.reset_pin_attempts += 1;
    await this.save();
    return false;
  }

  return true;
};

// Clear the PIN after successful use
adminSchema.methods.clearResetPin = async function () {
  this.reset_pin = null;
  this.reset_pin_expires_at = null;
  this.reset_pin_attempts = 0;
  await this.save();
};

const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;

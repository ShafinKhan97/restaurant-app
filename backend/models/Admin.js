const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a name"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false, // Don't return password by default in queries
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

// Generate 6-digit reset PIN
adminSchema.methods.generateResetPin = function () {
  // Generate random 6-digit PIN
  const pin = crypto.randomInt(100000, 999999).toString();

  // Hash PIN before storing in DB
  this.reset_pin = crypto.createHash("sha256").update(pin).digest("hex");
  this.reset_pin_expires_at = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Return plain PIN (to send via email)
  return pin;
};

const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;

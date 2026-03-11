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
  if (!this.isModified("password")) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
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

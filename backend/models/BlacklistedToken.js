const mongoose = require("mongoose");

const blacklistedTokenSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
    },
    expires_at: {
      type: Date,
      required: true,
      index: { expires: 0 }, // Auto-delete when token expires (TTL index)
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: false,
    },
  }
);

const BlacklistedToken = mongoose.model("BlacklistedToken", blacklistedTokenSchema);

module.exports = BlacklistedToken;

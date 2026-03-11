const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const BlacklistedToken = require("../models/BlacklistedToken");
const sendEmail = require("../utils/sendEmail");

// Generate JWT token
const generateToken = (admin) => {
  return jwt.sign(
    {
      id: admin._id,
      role: admin.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// @desc    Register a new admin
// @route   POST /api/auth/signup
// @access  Public
const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if admin already exists
    const adminExists = await Admin.findOne({ email });

    if (adminExists) {
      return res.status(400).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    // Create admin
    const admin = await Admin.create({
      name,
      email,
      password,
      role: role || "restaurant_admin",
    });

    // Generate token
    const token = generateToken(admin);

    res.status(201).json({
      success: true,
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during signup",
    });
  }
};

// @desc    Login admin
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Find admin and include password field
    const admin = await Admin.findOne({ email }).select("+password");

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check password
    const isMatch = await admin.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate token
    const token = generateToken(admin);

    res.status(200).json({
      success: true,
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};

// @desc    Forgot password - send reset PIN via email
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please provide an email",
      });
    }

    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email",
      });
    }

    // Generate 6-digit reset PIN
    const resetPin = admin.generateResetPin();
    await admin.save({ validateBeforeSave: false });

    // Send email with PIN
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset</h2>
        <p>You requested a password reset. Use the following PIN to reset your password:</p>
        <div style="background: #f4f4f4; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #333;">${resetPin}</span>
        </div>
        <p style="color: #666;">This PIN will expire in <strong>10 minutes</strong>.</p>
        <p style="color: #999; font-size: 12px;">If you didn't request this, please ignore this email.</p>
      </div>
    `;

    try {
      await sendEmail({
        email: admin.email,
        subject: "Password Reset PIN - Restaurant App",
        html,
      });

      res.status(200).json({
        success: true,
        message: "Reset PIN sent to your email",
      });
    } catch (emailError) {
      // If email fails, clear the reset PIN
      admin.reset_pin = null;
      admin.reset_pin_expires_at = null;
      await admin.save({ validateBeforeSave: false });

      console.error("Email send error:", emailError);
      return res.status(500).json({
        success: false,
        message: "Email could not be sent. Please try again later.",
      });
    }
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Reset password using PIN
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { email, pin, password } = req.body;

    if (!email || !pin || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email, PIN, and new password",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    // Hash the incoming PIN to compare with stored hash
    const crypto = require("crypto");
    const hashedPin = crypto.createHash("sha256").update(pin).digest("hex");

    // Find admin with valid reset PIN
    const admin = await Admin.findOne({
      email,
      reset_pin: hashedPin,
      reset_pin_expires_at: { $gt: Date.now() },
    });

    if (!admin) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired PIN",
      });
    }

    // Update password and clear reset PIN
    admin.password = password;
    admin.reset_pin = null;
    admin.reset_pin_expires_at = null;
    await admin.save();

    // Generate new token after password reset
    const token = generateToken(admin);

    res.status(200).json({
      success: true,
      message: "Password reset successful",
      token,
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
// @desc    Logout admin (blacklist token)
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "No token provided",
      });
    }

    // Decode token to get expiry
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const expiresAt = new Date(decoded.exp * 1000);

    // Add token to blacklist
    await BlacklistedToken.create({
      token,
      expires_at: expiresAt,
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during logout",
    });
  }
};

module.exports = { signup, login, forgotPassword, resetPassword, logout };

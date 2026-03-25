const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const Admin = require("../models/Admin");
const sendEmail = require("../utils/sendEmail");
const { generatePinEmailTemplate } = require("../utils/emailTemplates");

// Generate JWT token
const generateToken = (admin) => {
  return jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// POST /api/auth/signup
const signup = async (req, res) => {
  try {
    const first_name = (req.body.first_name || "").trim();
    const last_name = (req.body.last_name || "").trim();
    const email = (req.body.email || "").trim();
    const password = (req.body.password || "").trim();
    const { role } = req.body;

    if (!first_name) {
      return res
        .status(400)
        .json({ success: false, message: "First name is required" });
    }
    if (!/^[a-zA-Z]+$/.test(first_name)) {
      return res
        .status(400)
        .json({
          success: false,
          message: "First name can only contain letters",
        });
    }
    if (!last_name) {
      return res
        .status(400)
        .json({ success: false, message: "Last name is required" });
    }
    if (!/^[a-zA-Z]+$/.test(last_name)) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Last name can only contain letters",
        });
    }
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }
    if (!password) {
      return res
        .status(400)
        .json({ success: false, message: "Password is required" });
    }

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      if (existingAdmin.is_verified) {
        return res.status(400).json({
          success: false,
          message: "An account with this email already exists",
        });
      } else {
        await Admin.deleteOne({ _id: existingAdmin._id });
      }
    }

    const admin = await Admin.create({
      first_name,
      last_name,
      email,
      password,
      role: role || "restaurant_admin",
    });

    // Generate and send email verification PIN
    const verificationPin = admin.generateVerificationPin();
    await admin.save({ validateBeforeSave: false });

    const html = generatePinEmailTemplate(
      "Verify Your Email",
      "Thank you for signing up. Use the PIN below to verify your email address:",
      verificationPin,
      "If you didn't create an account, please ignore this email."
    );

    try {
      await sendEmail({
        email: admin.email,
        subject: "Verify Your Email - Restaurant App",
        html,
      });

      res.status(201).json({
        success: true,
        message:
          "Account created. Please check your email for the verification PIN.",
        admin: {
          id: admin._id,
          first_name: admin.first_name,
          last_name: admin.last_name,
          email: admin.email,
          role: admin.role,
          is_suspended: admin.is_suspended || false,
        }
      });
    } catch (emailError) {
      // If email fails, delete the created admin so they can try again
      await Admin.findByIdAndDelete(admin._id);
      console.error("Email send error:", emailError);
      res
        .status(500)
        .json({
          success: false,
          message: "Failed to send verification email. Please try again.",
        });
    }
  } catch (error) {
    console.error("Signup error:", error);
    if (error.name === "ValidationError") {
      const message = Object.values(error.errors)
        .map((e) => e.message)
        .join(", ");
      return res.status(400).json({ success: false, message });
    }
    res
      .status(500)
      .json({ success: false, message: "Server error during signup" });
  }
};

// POST /api/auth/verify-email
const verifyEmail = async (req, res) => {
  try {
    const { email, pin } = req.body;

    if (!email || !pin) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and PIN",
      });
    }

    const hashedPin = crypto.createHash("sha256").update(pin).digest("hex");

    const admin = await Admin.findOne({
      email,
      verification_pin: hashedPin,
      verification_pin_expires_at: { $gt: Date.now() },
    });

    if (!admin) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification PIN",
      });
    }

    // Mark as verified and clear the pin
    admin.is_verified = true;
    admin.verification_pin = null;
    admin.verification_pin_expires_at = null;

    const token = generateToken(admin);
    admin.current_token = token;
    await admin.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
      token,
      admin: {
        id: admin._id,
        first_name: admin.first_name,
        last_name: admin.last_name,
        email: admin.email,
        role: admin.role,
        is_verified: admin.is_verified,
      },
    });
  } catch (error) {
    console.error("Verify email error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// POST /api/auth/resend-verification
const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide an email" });
    }

    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res
        .status(404)
        .json({ success: false, message: "No account found with this email" });
    }

    if (admin.is_verified) {
      return res
        .status(400)
        .json({ success: false, message: "This account is already verified" });
    }

    const verificationPin = admin.generateVerificationPin();
    await admin.save({ validateBeforeSave: false });

    const html = generatePinEmailTemplate(
      "Verify Your Email",
      "Here is your new verification PIN:",
      verificationPin
    );

    try {
      await sendEmail({
        email: admin.email,
        subject: "Email Verification PIN - Restaurant App",
        html,
      });

      res
        .status(200)
        .json({
          success: true,
          message: "Verification PIN resent to your email",
        });
    } catch (emailError) {
      console.error("Email send error:", emailError);
      res.status(500).json({ success: false, message: "Failed to send email" });
    }
  } catch (error) {
    console.error("Resend verification error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    const admin = await Admin.findOne({ email }).select("+password");
    if (!admin || !(await admin.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Block login if email not verified
    if (!admin.is_verified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before logging in",
      });
    }

    const token = generateToken(admin);

    // Replace any previous token — old sessions are instantly invalidated
    admin.current_token = token;
    await admin.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      token,
      admin: {
        id: admin._id,
        first_name: admin.first_name,
        last_name: admin.last_name,
        email: admin.email,
        role: admin.role,
        is_suspended: admin.is_suspended || false,
        is_verified: admin.is_verified,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error during login" });
  }
};

// POST /api/auth/logout
const logout = async (req, res) => {
  try {
    await Admin.findByIdAndUpdate(req.user.id, { current_token: null });

    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error during logout" });
  }
};

// POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide an email" });
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res
        .status(404)
        .json({ success: false, message: "No account found with this email" });
    }

    if (!admin.is_verified) {
      return res
        .status(403)
        .json({ success: false, message: "Please verify your email first" });
    }

    const resetPin = admin.generateResetPin();
    await admin.save({ validateBeforeSave: false });

    const html = generatePinEmailTemplate(
      "Password Reset",
      "Use the following PIN to reset your password:",
      resetPin,
      "If you didn't request this, please ignore this email."
    );

    try {
      await sendEmail({
        email: admin.email,
        subject: "Password Reset PIN - Restaurant App",
        html,
      });

      res
        .status(200)
        .json({ success: true, message: "Reset PIN sent to your email" });
    } catch (emailError) {
      admin.reset_pin = null;
      admin.reset_pin_expires_at = null;
      await admin.save({ validateBeforeSave: false });

      console.error("Email send error:", emailError);
      res
        .status(500)
        .json({ success: false, message: "Email could not be sent" });
    }
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// POST /api/auth/reset-password
const resetPassword = async (req, res) => {
  try {
    const { email, pin, password } = req.body;

    if (!email || !pin || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email, PIN, and new password",
      });
    }

    const hashedPin = crypto.createHash("sha256").update(pin).digest("hex");

    // `password` has `select: false` in the schema, so we must explicitly load it
    // to compare hashes during the reset flow.
    const admin = await Admin.findOne({
      email,
      reset_pin: hashedPin,
      reset_pin_expires_at: { $gt: Date.now() },
    }).select("+password");

    if (!admin) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired PIN" });
    }

    const isSamePassword = await admin.matchPassword(password);
    if (isSamePassword) {
      return res
        .status(400)
        .json({
          success: false,
          message: "New password must be different from your current password",
        });
    }

    admin.password = password;
    admin.reset_pin = null;
    admin.reset_pin_expires_at = null;
    await admin.save();

    const token = generateToken(admin);
    admin.current_token = token;
    await admin.save({ validateBeforeSave: false });

    res
      .status(200)
      .json({ success: true, message: "Password reset successful", token });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// PUT /api/auth/profile
const updateProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id);
    if (!admin) {
      return res
        .status(404)
        .json({ success: false, message: "Admin not found" });
    }

    if (req.body.first_name !== undefined) {
      const newFirstName = req.body.first_name.trim();
      if (!newFirstName) {
        return res
          .status(400)
          .json({ success: false, message: "First name cannot be blank" });
      }
      if (!/^[a-zA-Z]+$/.test(newFirstName)) {
        return res
          .status(400)
          .json({
            success: false,
            message: "First name can only contain letters",
          });
      }
      if (newFirstName === admin.first_name) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "New first name must be different from your current first name",
          });
      }
      admin.first_name = newFirstName;
    }

    if (req.body.last_name !== undefined) {
      const newLastName = req.body.last_name.trim();
      if (!newLastName) {
        return res
          .status(400)
          .json({ success: false, message: "Last name cannot be blank" });
      }
      if (!/^[a-zA-Z]+$/.test(newLastName)) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Last name can only contain letters",
          });
      }
      if (newLastName === admin.last_name) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "New last name must be different from your current last name",
          });
      }
      admin.last_name = newLastName;
    }
    admin.email = req.body.email || admin.email;

    const updatedAdmin = await admin.save();

    res.status(200).json({
      success: true,
      admin: {
        id: updatedAdmin._id,
        first_name: updatedAdmin.first_name,
        last_name: updatedAdmin.last_name,
        email: updatedAdmin.email,
        role: updatedAdmin.role,
        is_verified: updatedAdmin.is_verified,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ success: false, message: "Email already exists" });
    }
    console.error("Update profile error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// PUT /api/auth/password
const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide current password and new password",
      });
    }

    const admin = await Admin.findById(req.user.id).select("+password");
    if (!admin) {
      return res
        .status(404)
        .json({ success: false, message: "Admin not found" });
    }

    const isMatch = await admin.matchPassword(currentPassword);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Incorrect current password" });
    }

    if (currentPassword === newPassword) {
      return res
        .status(400)
        .json({
          success: false,
          message: "New password must be different from your current password",
        });
    }

    admin.password = newPassword;
    await admin.save();

    res
      .status(200)
      .json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("Update password error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Toggle admin suspension status
// @route   PUT /api/auth/admin/:id/suspend
// @access  Private (Super Admin)
const toggleAdminSuspension = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent suspending another super admin
    if (admin.role === "super_admin") {
       return res.status(403).json({
         success: false,
         message: "Cannot suspend a super admin account",
       });
    }

    admin.is_suspended = !admin.is_suspended;
    await admin.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: `Account has been ${admin.is_suspended ? 'suspended' : 'unsuspended'}`,
      is_suspended: admin.is_suspended,
    });
  } catch (error) {
    console.error("Toggle suspension error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  signup,
  verifyEmail,
  resendVerification,
  login,
  logout,
  forgotPassword,
  resetPassword,
  updateProfile,
  updatePassword,
  toggleAdminSuspension,
};

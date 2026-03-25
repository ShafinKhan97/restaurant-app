const multer = require("multer");
const multerS3 = require("multer-s3");
const path = require("path");
const { s3Client, bucketName } = require("../utils/s3");

// Allowed image MIME types
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

// Max file size: 5 MB
const MAX_SIZE = 5 * 1024 * 1024;

const upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: bucketName,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => {
      // If restaurant ID is known (update route), use it. Otherwise, fallback to admin ID or 'new'.
      const parentId = req.params.restaurantId || req.params.id || req.user?._id?.toString() || "new";
      const menuItemId = req.params.menuItemId || "general";
      const ext = path.extname(file.originalname);
      const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      
      // Prefix filename with field name if it's logo or banner
      const prefix = file.fieldname === "logo" ? "logo-" : file.fieldname === "banner" ? "banner-" : "";
      
      const key = `restaurant-images/${parentId}/${menuItemId}/${prefix}${uniqueName}`;
      cb(null, key);
    },
  }),
  fileFilter: (req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new multer.MulterError(
          "LIMIT_UNEXPECTED_FILE",
          "Only .jpg, .png, and .webp images are allowed"
        )
      );
    }
  },
  limits: {
    fileSize: MAX_SIZE,
  },
});

// Single file upload middleware — field name: "image"
const uploadSingle = upload.single("image");

// Wrapper to handle Multer errors gracefully
const handleUpload = (req, res, next) => {
  uploadSingle(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          success: false,
          message: "File too large. Maximum size is 5 MB.",
        });
      }
      if (err.code === "LIMIT_UNEXPECTED_FILE") {
        return res.status(400).json({
          success: false,
          message: err.field || "Only .jpg, .png, and .webp images are allowed",
        });
      }
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }

    if (err) {
      return res.status(500).json({
        success: false,
        message: "Error uploading file",
      });
    }

    next();
  });
};

// Multi-field upload middleware for restaurants (logo and banner)
const uploadRestaurantImagesMulti = upload.fields([
  { name: "logo", maxCount: 1 },
  { name: "banner", maxCount: 1 },
]);

// Wrapper to handle Multer errors gracefully for restaurant images
const handleRestaurantUpload = (req, res, next) => {
  uploadRestaurantImagesMulti(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          success: false,
          message: "A file is too large. Maximum size is 5 MB per file.",
        });
      }
      if (err.code === "LIMIT_UNEXPECTED_FILE") {
        return res.status(400).json({
          success: false,
          message:
            err.field ||
            "Unexpected file field or too many files uploaded for a field.",
        });
      }
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }

    if (err) {
      return res.status(500).json({
        success: false,
        message: "Error uploading restaurant images",
      });
    }

    next();
  });
};

module.exports = { handleUpload, handleRestaurantUpload };

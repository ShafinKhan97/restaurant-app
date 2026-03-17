const multer = require("multer");
const multerS3 = require("multer-s3");
const path = require("path");
const { s3Client, bucketName } = require("../config/s3");

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
      const restaurantId = req.params.restaurantId || "unknown";
      const menuItemId = req.params.menuItemId || "unknown";
      const ext = path.extname(file.originalname);
      const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      const key = `restaurant-images/${restaurantId}/${menuItemId}/${uniqueName}`;
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

module.exports = { handleUpload };

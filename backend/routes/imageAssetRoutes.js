const express = require("express");
const router = express.Router({ mergeParams: true }); // mergeParams to access :restaurantId and :menuItemId
const { protect, authorize } = require("../middleware/authMiddleware");
const { handleUpload } = require("../middleware/upload");
const {
  createImageAsset,
  getImageAssets,
  getImageAsset,
  updateImageAsset,
  deleteImageAsset,
} = require("../controllers/imageAssetController");

// All routes are nested under /api/restaurants/:restaurantId/menu-items/:menuItemId/image-assets
// All routes are protected — only restaurant_admin and super_admin
router.use(protect, authorize("restaurant_admin", "super_admin"));

router.route("/").post(handleUpload, createImageAsset).get(getImageAssets);

router
  .route("/:imageId")
  .get(getImageAsset)
  .put(handleUpload, updateImageAsset)
  .delete(deleteImageAsset);

module.exports = router;

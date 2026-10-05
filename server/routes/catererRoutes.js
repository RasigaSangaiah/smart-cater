const express = require("express");
const router = express.Router();
const {
  getCaterers,
  getCatererById,
  getMyCatererProfile,
  createCatererProfile,
  updateCaterer,
  uploadCatererImages,
  deleteCaterer,
} = require("../controllers/catererController");
const {
  getCatererDashboard,
  getAvailability,
  setAvailability,
} = require("../controllers/catererDashboardController");
const { protect, authorize } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.get("/", getCaterers);
router.get("/me/profile", protect, authorize("caterer"), getMyCatererProfile);
router.get("/me/dashboard", protect, authorize("caterer"), getCatererDashboard);
router.post("/", protect, authorize("caterer"), createCatererProfile);

router.get("/:id", getCatererById);
router.put("/:id", protect, authorize("caterer", "admin"), updateCaterer);
router.delete("/:id", protect, authorize("admin"), deleteCaterer);
router.post(
  "/:id/images",
  protect,
  authorize("caterer", "admin"),
  upload.array("images", 6),
  uploadCatererImages
);

router.get("/:id/availability", getAvailability);
router.post("/:id/availability", protect, authorize("caterer"), setAvailability);

module.exports = router;

const express = require("express");
const router = express.Router();
const {
  getMenuByCaterer,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} = require("../controllers/menuController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.get("/:catererId", getMenuByCaterer);
router.post("/", protect, authorize("caterer", "admin"), createMenuItem);
router.put("/:id", protect, authorize("caterer", "admin"), updateMenuItem);
router.delete("/:id", protect, authorize("caterer", "admin"), deleteMenuItem);

module.exports = router;

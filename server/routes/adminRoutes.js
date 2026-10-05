const express = require("express");
const router = express.Router();
const {
  getDashboardStats,
  getUsers,
  toggleBlockUser,
  getAllCaterersAdmin,
  approveCaterer,
  getAllBookingsAdmin,
  exportBookingsExcel,
} = require("../controllers/adminController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.get("/export", protect, authorize("admin"), exportBookingsExcel);

router.use(protect, authorize("admin"));

router.get("/dashboard", getDashboardStats);
router.get("/users", getUsers);
router.put("/users/:id/block", toggleBlockUser);
router.get("/caterers", getAllCaterersAdmin);
router.put("/caterers/:id/approve", approveCaterer);
router.get("/bookings", getAllBookingsAdmin);

module.exports = router;
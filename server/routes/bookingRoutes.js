const express = require("express");
const router = express.Router();
const {
  createBooking,
  getBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
  downloadInvoice,
} = require("../controllers/bookingController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.post("/", protect, authorize("customer"), createBooking);
router.get("/", protect, getBookings);
router.get("/:id", protect, getBookingById);
router.get("/:id/invoice", protect, downloadInvoice);
router.put("/:id/status", protect, authorize("caterer", "admin"), updateBookingStatus);
router.delete("/:id", protect, authorize("customer"), cancelBooking);

module.exports = router;
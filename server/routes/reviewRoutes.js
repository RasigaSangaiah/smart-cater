const express = require("express");
const router = express.Router();
const { createReview, getReviewsByCaterer } = require("../controllers/reviewController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.post("/", protect, authorize("customer"), createReview);
router.get("/:catererId", getReviewsByCaterer);

module.exports = router;

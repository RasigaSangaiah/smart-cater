const asyncHandler = require("express-async-handler");
const Review = require("../models/Review");
const Booking = require("../models/Booking");
const Caterer = require("../models/Caterer");

// @desc    Add a review after event completion
// @route   POST /api/reviews
// @access  Private (customer)
const createReview = asyncHandler(async (req, res) => {
  const { bookingId, rating, comment } = req.body;

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    res.status(404);
    throw new Error("Booking not found");
  }

  if (booking.customer.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to review this booking");
  }

  if (booking.bookingStatus !== "Completed") {
    res.status(400);
    throw new Error("You can only review a booking after the event is completed");
  }

  if (booking.reviewed) {
    res.status(400);
    throw new Error("You have already reviewed this booking");
  }

  const review = await Review.create({
    customer: req.user._id,
    caterer: booking.caterer,
    booking: booking._id,
    rating,
    comment,
  });

  booking.reviewed = true;
  await booking.save();

  // Recalculate caterer's average rating
  const stats = await Review.aggregate([
    { $match: { caterer: booking.caterer } },
    { $group: { _id: "$caterer", avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);

  if (stats.length > 0) {
    await Caterer.findByIdAndUpdate(booking.caterer, {
      rating: Math.round(stats[0].avgRating * 10) / 10,
      numReviews: stats[0].count,
    });
  }

  res.status(201).json({ success: true, review });
});

// @desc    Get reviews for a caterer
// @route   GET /api/reviews/:catererId
// @access  Public
const getReviewsByCaterer = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ caterer: req.params.catererId })
    .populate("customer", "name")
    .sort({ createdAt: -1 });

  res.json({ success: true, count: reviews.length, reviews });
});

module.exports = { createReview, getReviewsByCaterer };

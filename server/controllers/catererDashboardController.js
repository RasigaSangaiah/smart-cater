const asyncHandler = require("express-async-handler");
const Caterer = require("../models/Caterer");
const Booking = require("../models/Booking");
const Availability = require("../models/Availability");

// @desc    Get caterer dashboard statistics
// @route   GET /api/caterers/me/dashboard
// @access  Private (caterer)
const getCatererDashboard = asyncHandler(async (req, res) => {
  const caterer = await Caterer.findOne({ user: req.user._id });
  if (!caterer) {
    res.status(404);
    throw new Error("Caterer profile not found");
  }

  const bookings = await Booking.find({ caterer: caterer._id });

  const totalBookings = bookings.length;
  const pendingRequests = bookings.filter((b) => b.bookingStatus === "Pending").length;
  const upcomingEvents = bookings.filter((b) =>
    ["Confirmed", "Accepted", "In Preparation"].includes(b.bookingStatus) &&
    new Date(b.eventDate) >= new Date()
  ).length;
  const completedBookings = bookings.filter((b) => b.bookingStatus === "Completed").length;

  const revenue = bookings.reduce((sum, b) => sum + (b.amountPaid || 0), 0);

  const now = new Date();
  const monthlyRevenue = bookings
    .filter((b) => {
      const created = new Date(b.updatedAt);
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
    })
    .reduce((sum, b) => sum + (b.amountPaid || 0), 0);

  res.json({
    success: true,
    stats: {
      totalBookings,
      upcomingEvents,
      pendingRequests,
      completedBookings,
      revenue,
      monthlyRevenue,
      averageRating: caterer.rating,
    },
  });
});

// @desc    Get/manage availability calendar for a caterer
// @route   GET /api/caterers/:id/availability
// @access  Public
const getAvailability = asyncHandler(async (req, res) => {
  const availability = await Availability.find({ caterer: req.params.id }).sort({ date: 1 });
  res.json({ success: true, availability });
});

// @desc    Block/unblock a specific date manually (caterer sets unavailable days)
// @route   POST /api/caterers/:id/availability
// @access  Private (caterer)
const setAvailability = asyncHandler(async (req, res) => {
  const caterer = await Caterer.findById(req.params.id);
  if (!caterer) {
    res.status(404);
    throw new Error("Caterer not found");
  }
  if (caterer.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized");
  }

  const { date, available } = req.body;

  const record = await Availability.findOneAndUpdate(
    { caterer: caterer._id, date: new Date(date) },
    { caterer: caterer._id, date: new Date(date), available },
    { upsert: true, new: true }
  );

  res.json({ success: true, availability: record });
});

module.exports = { getCatererDashboard, getAvailability, setAvailability };

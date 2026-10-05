const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const Caterer = require("../models/Caterer");
const Booking = require("../models/Booking");
const Menu = require("../models/Menu");
const { exportBookings } = require("../services/excelService");

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private (admin)
const getDashboardStats = asyncHandler(async (req, res) => {
  const [totalCustomers, totalCaterers, bookings] = await Promise.all([
    User.countDocuments({ role: "customer" }),
    Caterer.countDocuments(),
    Booking.find(),
  ]);

  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter((b) => b.bookingStatus === "Confirmed").length;
  const pendingBookings = bookings.filter((b) => b.bookingStatus === "Pending").length;
  const completedBookings = bookings.filter((b) => b.bookingStatus === "Completed").length;
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.amountPaid || 0), 0);

  const now = new Date();
  const monthlyRevenue = bookings
    .filter((b) => {
      const d = new Date(b.updatedAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, b) => sum + (b.amountPaid || 0), 0);

  // Most booked caterers
  const catererCounts = {};
  bookings.forEach((b) => {
    const id = b.caterer.toString();
    catererCounts[id] = (catererCounts[id] || 0) + 1;
  });
  const topCatererIds = Object.entries(catererCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id]) => id);
  const mostBookedCaterers = await Caterer.find({ _id: { $in: topCatererIds } }).select("name rating");

  // Most popular menu items
  const itemCounts = {};
  bookings.forEach((b) => {
    (b.selectedMenu || []).forEach((m) => {
      itemCounts[m.itemName] = (itemCounts[m.itemName] || 0) + 1;
    });
  });
  const mostPopularMenuItems = Object.entries(itemCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([itemName, count]) => ({ itemName, count }));

  res.json({
    success: true,
    stats: {
      totalCustomers,
      totalCaterers,
      totalBookings,
      confirmedBookings,
      pendingBookings,
      completedBookings,
      totalRevenue,
      monthlyRevenue,
      mostBookedCaterers,
      mostPopularMenuItems,
    },
  });
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (admin)
const getUsers = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.role) filter.role = req.query.role;
  const users = await User.find(filter).sort({ createdAt: -1 });
  res.json({ success: true, count: users.length, users });
});

// @desc    Block/unblock a user
// @route   PUT /api/admin/users/:id/block
// @access  Private (admin)
const toggleBlockUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  user.isBlocked = !user.isBlocked;
  await user.save();
  res.json({ success: true, user });
});

// @desc    Get all caterers (incl. unapproved) for admin
// @route   GET /api/admin/caterers
// @access  Private (admin)
const getAllCaterersAdmin = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.approved !== undefined) filter.approved = req.query.approved === "true";
  const caterers = await Caterer.find(filter).sort({ createdAt: -1 });
  res.json({ success: true, count: caterers.length, caterers });
});

// @desc    Approve/reject caterer registration
// @route   PUT /api/admin/caterers/:id/approve
// @access  Private (admin)
const approveCaterer = asyncHandler(async (req, res) => {
  const caterer = await Caterer.findById(req.params.id);
  if (!caterer) {
    res.status(404);
    throw new Error("Caterer not found");
  }
  caterer.approved = req.body.approved !== undefined ? req.body.approved : true;
  await caterer.save();
  res.json({ success: true, caterer });
});

// @desc    Get all bookings (admin)
// @route   GET /api/admin/bookings
// @access  Private (admin)
const getAllBookingsAdmin = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.bookingStatus = req.query.status;
  const bookings = await Booking.find(filter)
    .populate("customer", "name email phone")
    .populate("caterer", "name location")
    .sort({ createdAt: -1 });
  res.json({ success: true, count: bookings.length, bookings });
});

// @desc    Export/download the shared bookings Excel file
// @route   GET /api/admin/export
// @access  Private (admin)
const exportBookingsExcel = asyncHandler(async (req, res) => {
  const filePath = await exportBookings();
  res.download(filePath, "CateringOrders.xlsx");
});

module.exports = {
  getDashboardStats,
  getUsers,
  toggleBlockUser,
  getAllCaterersAdmin,
  approveCaterer,
  getAllBookingsAdmin,
  exportBookingsExcel,
};

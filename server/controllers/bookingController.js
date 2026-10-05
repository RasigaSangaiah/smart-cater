const asyncHandler = require("express-async-handler");
const Booking = require("../models/Booking");
const Caterer = require("../models/Caterer");
const Menu = require("../models/Menu");
const Availability = require("../models/Availability");
const generateBookingId = require("../utils/generateBookingId");
const { calculatePrice } = require("../services/pricingService");
const { appendBookingToExcel, updateBookingInExcel } = require("../services/excelService");
const { streamInvoicePDF } = require("../services/invoiceService");
const {
  sendBookingConfirmationEmail,
  sendBookingCancellationEmail,
} = require("../services/emailService");

// @desc    Create a new booking (Pending status, awaiting caterer acceptance)
// @route   POST /api/bookings
// @access  Private (customer)
const createBooking = asyncHandler(async (req, res) => {
  const {
    catererId,
    eventType,
    eventDate,
    eventTime,
    location,
    guestCount,
    specialRequirements,
    selectedMenuItemIds,
    additionalServices,
  } = req.body;

  if (!catererId || !eventType || !eventDate || !eventTime || !location || !guestCount) {
    res.status(400);
    throw new Error("Please fill in all required event details");
  }

  if (Number(guestCount) <= 0) {
    res.status(400);
    throw new Error("Guest count must be greater than 0");
  }

  const parsedDate = new Date(eventDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (parsedDate < today) {
    res.status(400);
    throw new Error("Event date cannot be in the past");
  }

  const caterer = await Caterer.findById(catererId);
  if (!caterer || !caterer.approved) {
    res.status(404);
    throw new Error("Caterer not found or not available for booking");
  }

  // Prevent double booking for the same caterer + date
  const existingAvailability = await Availability.findOne({
    caterer: catererId,
    date: parsedDate,
    available: false,
  });
  if (existingAvailability) {
    res.status(400);
    throw new Error("This caterer is already booked on the selected date");
  }

  if (!selectedMenuItemIds || selectedMenuItemIds.length === 0) {
    res.status(400);
    throw new Error("Please select at least one menu item");
  }

  const menuItems = await Menu.find({ _id: { $in: selectedMenuItemIds }, caterer: catererId });
  if (menuItems.length !== selectedMenuItemIds.length) {
    res.status(400);
    throw new Error("Some selected menu items are invalid for this caterer");
  }

  const selectedMenu = menuItems.map((m) => ({
    menuItem: m._id,
    itemName: m.itemName,
    category: m.category,
    pricePerPerson: m.pricePerPerson,
  }));

  const services = (additionalServices || []).map((s) => ({ name: s.name, price: Number(s.price) || 0 }));

  const pricing = calculatePrice(Number(guestCount), selectedMenu, services);

  const bookingId = await generateBookingId();

  const booking = await Booking.create({
    bookingId,
    customer: req.user._id,
    caterer: catererId,
    eventType,
    eventDate: parsedDate,
    eventTime,
    location,
    guestCount,
    specialRequirements,
    selectedMenu,
    additionalServices: services,
    ...pricing,
    bookingStatus: "Pending",
    paymentStatus: "Pending",
  });

  const populated = await Booking.findById(booking._id)
    .populate("customer", "name email phone")
    .populate("caterer", "name email location");

  res.status(201).json({ success: true, booking: populated });
});

// @desc    Get bookings (customer -> own, caterer -> own caterer's, admin -> all)
// @route   GET /api/bookings
// @access  Private
const getBookings = asyncHandler(async (req, res) => {
  let filter = {};

  if (req.user.role === "customer") {
    filter.customer = req.user._id;
  } else if (req.user.role === "caterer") {
    const caterer = await Caterer.findOne({ user: req.user._id });
    if (!caterer) return res.json({ success: true, bookings: [] });
    filter.caterer = caterer._id;
  }
  // admin sees all

  if (req.query.status) filter.bookingStatus = req.query.status;

  const bookings = await Booking.find(filter)
    .populate("customer", "name email phone")
    .populate("caterer", "name location images")
    .sort({ createdAt: -1 });

  res.json({ success: true, count: bookings.length, bookings });
});

// @desc    Get a single booking by ID
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate("customer", "name email phone")
    .populate("caterer", "name email phone location images pricePerPlate");

  if (!booking) {
    res.status(404);
    throw new Error("Booking not found");
  }

  const isOwner = booking.customer._id.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "admin";
  let isCaterer = false;
  if (req.user.role === "caterer") {
    const catererProfile = await Caterer.findOne({ user: req.user._id });
    isCaterer = catererProfile && catererProfile._id.toString() === booking.caterer._id.toString();
  }

  if (!isOwner && !isAdmin && !isCaterer) {
    res.status(403);
    throw new Error("Not authorized to view this booking");
  }

  res.json({ success: true, booking });
});

// @desc    Update booking status (caterer accepts/rejects/updates, admin can too)
// @route   PUT /api/bookings/:id/status
// @access  Private (caterer, admin)
const updateBookingStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const validStatuses = [
    "Pending",
    "Accepted",
    "Rejected",
    "Confirmed",
    "In Preparation",
    "Completed",
    "Cancelled",
  ];

  if (!validStatuses.includes(status)) {
    res.status(400);
    throw new Error("Invalid booking status");
  }

  const booking = await Booking.findById(req.params.id)
    .populate("customer", "name email phone")
    .populate("caterer", "name email location");

  if (!booking) {
    res.status(404);
    throw new Error("Booking not found");
  }

  if (req.user.role === "caterer") {
    const catererProfile = await Caterer.findOne({ user: req.user._id });
    if (!catererProfile || catererProfile._id.toString() !== booking.caterer._id.toString()) {
      res.status(403);
      throw new Error("Not authorized to update this booking");
    }
  }

  booking.bookingStatus = status;
  await booking.save();

  // Lock the date in Availability once confirmed
  if (status === "Confirmed" || status === "Accepted") {
    await Availability.findOneAndUpdate(
      { caterer: booking.caterer._id, date: booking.eventDate },
      { caterer: booking.caterer._id, date: booking.eventDate, available: false, booking: booking._id },
      { upsert: true }
    );

    await appendBookingToExcel(booking);

    await sendBookingConfirmationEmail({
      to: booking.customer.email,
      customerName: booking.customer.name,
      booking,
      catererName: booking.caterer.name,
    }).catch((err) => console.error("Email send failed:", err.message));
  }

  if (status === "Cancelled" || status === "Rejected") {
    await Availability.findOneAndUpdate(
      { caterer: booking.caterer._id, date: booking.eventDate },
      { available: true, booking: null }
    );

    await updateBookingInExcel(booking).catch(() => {});

    await sendBookingCancellationEmail({
      to: booking.customer.email,
      customerName: booking.customer.name,
      booking,
    }).catch((err) => console.error("Email send failed:", err.message));
  }

  res.json({ success: true, booking });
});

// @desc    Cancel a booking (by customer)
// @route   DELETE /api/bookings/:id
// @access  Private (customer - own booking)
const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate("customer", "name email");

  if (!booking) {
    res.status(404);
    throw new Error("Booking not found");
  }

  if (booking.customer._id.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to cancel this booking");
  }

  if (["Completed", "Cancelled"].includes(booking.bookingStatus)) {
    res.status(400);
    throw new Error(`Booking is already ${booking.bookingStatus.toLowerCase()}`);
  }

  booking.bookingStatus = "Cancelled";
  await booking.save();

  await Availability.findOneAndUpdate(
    { caterer: booking.caterer, date: booking.eventDate },
    { available: true, booking: null }
  );

  await updateBookingInExcel(booking).catch(() => {});

  res.json({ success: true, message: "Booking cancelled", booking });
});

// @desc    Download a PDF invoice for a booking
// @route   GET /api/bookings/:id/invoice
// @access  Private
const downloadInvoice = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate("customer", "name email phone")
    .populate("caterer", "name email phone location");

  if (!booking) {
    res.status(404);
    throw new Error("Booking not found");
  }

  const isOwner = booking.customer._id.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "admin";
  let isCaterer = false;
  if (req.user.role === "caterer") {
    const catererProfile = await Caterer.findOne({ user: req.user._id });
    isCaterer = catererProfile && catererProfile._id.toString() === booking.caterer._id.toString();
  }

  if (!isOwner && !isAdmin && !isCaterer) {
    res.status(403);
    throw new Error("Not authorized to view this invoice");
  }

  streamInvoicePDF(res, booking);
});

module.exports = {
  createBooking,
  getBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
  downloadInvoice,
};

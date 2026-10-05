const asyncHandler = require("express-async-handler");
const Caterer = require("../models/Caterer");
const Menu = require("../models/Menu");
const Review = require("../models/Review");

// @desc    Get all approved caterers with search/filter
// @route   GET /api/caterers
// @access  Public
const getCaterers = asyncHandler(async (req, res) => {
  const { location, eventType, foodType, minPrice, maxPrice, minRating, search } = req.query;

  const filter = { approved: true, isBlocked: false };

  if (location) filter.$or = [
    { location: { $regex: location, $options: "i" } },
    { city: { $regex: location, $options: "i" } },
  ];
  if (eventType) filter.eventTypes = eventType;
  if (foodType && foodType !== "both") filter.foodType = { $in: [foodType, "both"] };
  if (minRating) filter.rating = { $gte: Number(minRating) };
  if (minPrice || maxPrice) {
    filter.pricePerPlate = {};
    if (minPrice) filter.pricePerPlate.$gte = Number(minPrice);
    if (maxPrice) filter.pricePerPlate.$lte = Number(maxPrice);
  }
  if (search) {
    filter.name = { $regex: search, $options: "i" };
  }

  const caterers = await Caterer.find(filter).sort({ rating: -1, createdAt: -1 });
  res.json({ success: true, count: caterers.length, caterers });
});

// @desc    Get single caterer by ID (with menu + reviews)
// @route   GET /api/caterers/:id
// @access  Public
const getCatererById = asyncHandler(async (req, res) => {
  const caterer = await Caterer.findById(req.params.id);
  if (!caterer) {
    res.status(404);
    throw new Error("Caterer not found");
  }

  const menu = await Menu.find({ caterer: caterer._id, isAvailable: true }).sort({ category: 1 });
  const reviews = await Review.find({ caterer: caterer._id })
    .populate("customer", "name")
    .sort({ createdAt: -1 });

  res.json({ success: true, caterer, menu, reviews });
});

// @desc    Get logged-in caterer's own profile
// @route   GET /api/caterers/me/profile
// @access  Private (caterer)
const getMyCatererProfile = asyncHandler(async (req, res) => {
  const caterer = await Caterer.findOne({ user: req.user._id });
  if (!caterer) {
    res.status(404);
    throw new Error("Caterer profile not found");
  }
  res.json({ success: true, caterer });
});

// @desc    Create/complete caterer profile
// @route   POST /api/caterers
// @access  Private (caterer)
const createCatererProfile = asyncHandler(async (req, res) => {
  const existing = await Caterer.findOne({ user: req.user._id });
  if (existing) {
    res.status(400);
    throw new Error("Caterer profile already exists. Use update instead.");
  }

  const caterer = await Caterer.create({ ...req.body, user: req.user._id, approved: false });
  res.status(201).json({ success: true, caterer });
});

// @desc    Update caterer profile
// @route   PUT /api/caterers/:id
// @access  Private (caterer - own profile, or admin)
const updateCaterer = asyncHandler(async (req, res) => {
  const caterer = await Caterer.findById(req.params.id);
  if (!caterer) {
    res.status(404);
    throw new Error("Caterer not found");
  }

  if (req.user.role === "caterer" && caterer.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to update this profile");
  }

  // Caterers cannot self-approve
  if (req.user.role === "caterer") delete req.body.approved;

  Object.assign(caterer, req.body);
  await caterer.save();

  res.json({ success: true, caterer });
});

// @desc    Upload caterer images
// @route   POST /api/caterers/:id/images
// @access  Private (caterer)
const uploadCatererImages = asyncHandler(async (req, res) => {
  const caterer = await Caterer.findById(req.params.id);
  if (!caterer) {
    res.status(404);
    throw new Error("Caterer not found");
  }

  if (caterer.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    res.status(403);
    throw new Error("Not authorized");
  }

  const newImages = (req.files || []).map((f) => ({ url: f.path, public_id: f.filename }));
  caterer.images.push(...newImages);
  await caterer.save();

  res.json({ success: true, images: caterer.images });
});

// @desc    Delete caterer (admin only)
// @route   DELETE /api/caterers/:id
// @access  Private (admin)
const deleteCaterer = asyncHandler(async (req, res) => {
  const caterer = await Caterer.findById(req.params.id);
  if (!caterer) {
    res.status(404);
    throw new Error("Caterer not found");
  }
  await caterer.deleteOne();
  res.json({ success: true, message: "Caterer removed" });
});

module.exports = {
  getCaterers,
  getCatererById,
  getMyCatererProfile,
  createCatererProfile,
  updateCaterer,
  uploadCatererImages,
  deleteCaterer,
};

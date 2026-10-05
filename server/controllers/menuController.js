const asyncHandler = require("express-async-handler");
const Menu = require("../models/Menu");
const Caterer = require("../models/Caterer");

const ensureOwnership = async (catererId, userId, userRole) => {
  const caterer = await Caterer.findById(catererId);
  if (!caterer) {
    const err = new Error("Caterer not found");
    err.statusCode = 404;
    throw err;
  }
  if (userRole !== "admin" && caterer.user.toString() !== userId.toString()) {
    const err = new Error("Not authorized to manage this caterer's menu");
    err.statusCode = 403;
    throw err;
  }
  return caterer;
};

// @desc    Get menu items for a caterer
// @route   GET /api/menus/:catererId
// @access  Public
const getMenuByCaterer = asyncHandler(async (req, res) => {
  const menu = await Menu.find({ caterer: req.params.catererId }).sort({ category: 1, itemName: 1 });
  res.json({ success: true, count: menu.length, menu });
});

// @desc    Add a menu item
// @route   POST /api/menus
// @access  Private (caterer)
const createMenuItem = asyncHandler(async (req, res) => {
  const { caterer: catererId } = req.body;
  await ensureOwnership(catererId, req.user._id, req.user.role);

  const item = await Menu.create(req.body);
  res.status(201).json({ success: true, item });
});

// @desc    Update a menu item
// @route   PUT /api/menus/:id
// @access  Private (caterer)
const updateMenuItem = asyncHandler(async (req, res) => {
  const item = await Menu.findById(req.params.id);
  if (!item) {
    res.status(404);
    throw new Error("Menu item not found");
  }

  await ensureOwnership(item.caterer, req.user._id, req.user.role);

  Object.assign(item, req.body);
  await item.save();

  res.json({ success: true, item });
});

// @desc    Delete a menu item
// @route   DELETE /api/menus/:id
// @access  Private (caterer)
const deleteMenuItem = asyncHandler(async (req, res) => {
  const item = await Menu.findById(req.params.id);
  if (!item) {
    res.status(404);
    throw new Error("Menu item not found");
  }

  await ensureOwnership(item.caterer, req.user._id, req.user.role);

  await item.deleteOne();
  res.json({ success: true, message: "Menu item removed" });
});

module.exports = { getMenuByCaterer, createMenuItem, updateMenuItem, deleteMenuItem };

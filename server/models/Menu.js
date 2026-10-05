const mongoose = require("mongoose");

const menuSchema = new mongoose.Schema(
  {
    caterer: { type: mongoose.Schema.Types.ObjectId, ref: "Caterer", required: true },
    category: {
      type: String,
      required: true,
      enum: [
        "Welcome Drinks",
        "Starters",
        "Main Course",
        "Rice",
        "Breads",
        "Side Dishes",
        "Desserts",
        "Ice Cream",
        "Beverages",
        "Special Items",
      ],
    },
    itemName: { type: String, required: true },
    description: { type: String, default: "" },
    pricePerPerson: { type: Number, required: true },
    image: { url: String, public_id: String },
    foodType: { type: String, enum: ["veg", "non-veg"], required: true },
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Menu", menuSchema);

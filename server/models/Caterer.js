const mongoose = require("mongoose");

const catererSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    ownerName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    location: { type: String, required: true },
    city: { type: String, required: true },
    description: { type: String, required: true },
    experience: { type: Number, default: 0 }, // years
    foodType: {
      type: String,
      enum: ["veg", "non-veg", "both"],
      default: "both",
    },
    eventTypes: [
      {
        type: String,
        enum: [
          "Wedding",
          "Reception",
          "Engagement",
          "Birthday",
          "Corporate Event",
          "College Function",
          "Anniversary",
          "Other",
        ],
      },
    ],
    pricePerPlate: { type: Number, required: true },
    images: [{ url: String, public_id: String }],
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    approved: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

catererSchema.index({ location: "text", city: "text", name: "text" });

module.exports = mongoose.model("Caterer", catererSchema);

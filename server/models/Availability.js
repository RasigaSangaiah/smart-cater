const mongoose = require("mongoose");

const availabilitySchema = new mongoose.Schema(
  {
    caterer: { type: mongoose.Schema.Types.ObjectId, ref: "Caterer", required: true },
    date: { type: Date, required: true },
    available: { type: Boolean, default: true },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", default: null },
  },
  { timestamps: true }
);

availabilitySchema.index({ caterer: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Availability", availabilitySchema);

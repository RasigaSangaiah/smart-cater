const mongoose = require("mongoose");

const selectedMenuItemSchema = new mongoose.Schema(
  {
    menuItem: { type: mongoose.Schema.Types.ObjectId, ref: "Menu" },
    itemName: String,
    category: String,
    pricePerPerson: Number,
  },
  { _id: false }
);

const additionalServiceSchema = new mongoose.Schema(
  {
    name: String,
    price: Number,
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    bookingId: { type: String, required: true, unique: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    caterer: { type: mongoose.Schema.Types.ObjectId, ref: "Caterer", required: true },

    eventType: {
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
      required: true,
    },
    eventDate: { type: Date, required: true },
    eventTime: { type: String, required: true },
    location: { type: String, required: true },
    guestCount: { type: Number, required: true, min: 1 },
    specialRequirements: { type: String, default: "" },

    selectedMenu: [selectedMenuItemSchema],
    additionalServices: [additionalServiceSchema],

    pricePerPerson: { type: Number, required: true },
    foodCost: { type: Number, required: true },
    serviceCharges: { type: Number, default: 0 },
    taxes: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    advanceAmount: { type: Number, required: true },
    remainingAmount: { type: Number, required: true },
    amountPaid: { type: Number, default: 0 },

    bookingStatus: {
      type: String,
      enum: [
        "Pending",
        "Accepted",
        "Rejected",
        "Confirmed",
        "In Preparation",
        "Completed",
        "Cancelled",
      ],
      default: "Pending",
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Partially Paid", "Paid"],
      default: "Pending",
    },
    paymentId: { type: String, default: null },
    reviewed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);

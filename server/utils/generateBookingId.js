const Booking = require("../models/Booking");

/**
 * Generates a sequential, human-readable booking ID like CAT1001, CAT1002...
 * Looks at the most recent booking in the DB to determine the next number.
 */
const generateBookingId = async () => {
  const lastBooking = await Booking.findOne().sort({ createdAt: -1 }).select("bookingId");

  let nextNumber = 1001;

  if (lastBooking && lastBooking.bookingId) {
    const lastNumber = parseInt(lastBooking.bookingId.replace("CAT", ""), 10);
    if (!Number.isNaN(lastNumber)) {
      nextNumber = lastNumber + 1;
    }
  }

  return `CAT${nextNumber}`;
};

module.exports = generateBookingId;

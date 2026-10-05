const asyncHandler = require("express-async-handler");
const crypto = require("crypto");
const Razorpay = require("razorpay");
const Booking = require("../models/Booking");
const Payment = require("../models/Payment");
const { updateBookingInExcel } = require("../services/excelService");
const { sendPaymentSuccessEmail } = require("../services/emailService");


const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "placeholder_secret",
});
// @desc    Create a Razorpay order for the advance (or remaining) amount
// @route   POST /api/payments/create-order
// @access  Private (customer)
const createOrder = asyncHandler(async (req, res) => {
  const { bookingId, amount } = req.body; // amount in rupees

  const booking = await Booking.findById(bookingId).populate("customer", "name email");
  if (!booking) {
    res.status(404);
    throw new Error("Booking not found");
  }

  if (booking.customer._id.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to pay for this booking");
  }

  const amountDue = booking.totalAmount - booking.amountPaid;
  if (amount > amountDue) {
    res.status(400);
    throw new Error("Payment amount cannot exceed the remaining amount due");
  }
  if (amount <= 0) {
    res.status(400);
    throw new Error("Payment amount must be greater than zero");
  }

  const order = await razorpay.orders.create({
    amount: Math.round(amount * 100), // paise
    currency: "INR",
    receipt: `${booking.bookingId}-${Date.now()}`,
    notes: { bookingId: booking.bookingId },
  });

  const payment = await Payment.create({
    booking: booking._id,
    customer: req.user._id,
    amount,
    razorpayOrderId: order.id,
    paymentStatus: "created",
  });

  res.status(201).json({
    success: true,
    order,
    paymentRecordId: payment._id,
    key: process.env.RAZORPAY_KEY_ID,
  });
});

// @desc    Verify Razorpay payment signature and update booking/payment records
// @route   POST /api/payments/verify
// @access  Private (customer)
const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentRecordId } = req.body;

  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (generatedSignature !== razorpay_signature) {
    res.status(400);
    throw new Error("Payment verification failed - signature mismatch");
  }

  const payment = await Payment.findById(paymentRecordId);
  if (!payment) {
    res.status(404);
    throw new Error("Payment record not found");
  }

  payment.razorpayPaymentId = razorpay_payment_id;
  payment.razorpaySignature = razorpay_signature;
  payment.paymentStatus = "success";
  payment.paidAt = new Date();
  await payment.save();

  const booking = await Booking.findById(payment.booking)
    .populate("customer", "name email")
    .populate("caterer", "name email location");

  booking.amountPaid += payment.amount;
  booking.remainingAmount = Math.max(booking.totalAmount - booking.amountPaid, 0);
  booking.paymentStatus = booking.remainingAmount === 0 ? "Paid" : "Partially Paid";
  booking.paymentId = razorpay_payment_id;
  await booking.save();

  await updateBookingInExcel(booking).catch((err) => console.error("Excel update failed:", err.message));
  await sendPaymentSuccessEmail({
    to: booking.customer.email,
    customerName: booking.customer.name,
    booking,
    catererName: booking.caterer.name,
    payment,
  }).catch((err) => console.error("Email send failed:", err.message));

  res.json({ success: true, message: "Payment verified successfully", booking, payment });
});

module.exports = { createOrder, verifyPayment };

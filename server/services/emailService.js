const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const formatMenu = (selectedMenu = []) => {
  if (!selectedMenu.length) return "<li>No items selected</li>";
  return selectedMenu
    .map(
      (item) =>
        `<li>${item.itemName} <span style="color:#888">(${item.category})</span> — ₹${item.pricePerPerson}/person</li>`
    )
    .join("");
};

const formatServices = (services = []) => {
  if (!services.length) return "<li>None</li>";
  return services.map((s) => `<li>${s.name} — ₹${s.price}</li>`).join("");
};

const baseWrapper = (title, bodyHtml) => `
  <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: auto; background:#FFF8F0; border-radius:12px; overflow:hidden; border:1px solid #F0E0CC;">
    <div style="background:#C1502E; padding:24px; text-align:center;">
      <h1 style="color:#fff; margin:0; font-size:22px;">SmartCater</h1>
      <p style="color:#FFE3D3; margin:4px 0 0;">${title}</p>
    </div>
    <div style="padding:24px; color:#3A2A20;">
      ${bodyHtml}
    </div>
    <div style="padding:16px 24px; background:#F3E7D8; color:#8A7458; font-size:12px; text-align:center;">
      This is an automated message from SmartCater. Please do not reply directly to this email.
    </div>
  </div>
`;

/** Sends the booking confirmation email once a caterer/admin confirms the booking. */
const sendBookingConfirmationEmail = async ({ to, customerName, booking, catererName }) => {
  const html = baseWrapper(
    "Your Catering Booking is Confirmed",
    `
    <p>Hi ${customerName},</p>
    <p>Great news! Your catering booking has been <strong>confirmed</strong>. Here are your event details:</p>
    <table style="width:100%; border-collapse:collapse; margin:16px 0;">
      <tr><td style="padding:6px 0; color:#8A7458;">Booking ID</td><td style="padding:6px 0; font-weight:bold;">${booking.bookingId}</td></tr>
      <tr><td style="padding:6px 0; color:#8A7458;">Caterer</td><td style="padding:6px 0;">${catererName}</td></tr>
      <tr><td style="padding:6px 0; color:#8A7458;">Event Type</td><td style="padding:6px 0;">${booking.eventType}</td></tr>
      <tr><td style="padding:6px 0; color:#8A7458;">Event Date</td><td style="padding:6px 0;">${new Date(booking.eventDate).toLocaleDateString("en-IN")}</td></tr>
      <tr><td style="padding:6px 0; color:#8A7458;">Event Time</td><td style="padding:6px 0;">${booking.eventTime}</td></tr>
      <tr><td style="padding:6px 0; color:#8A7458;">Location</td><td style="padding:6px 0;">${booking.location}</td></tr>
      <tr><td style="padding:6px 0; color:#8A7458;">Guest Count</td><td style="padding:6px 0;">${booking.guestCount}</td></tr>
    </table>
    <p style="margin-bottom:4px;"><strong>Selected Menu</strong></p>
    <ul>${formatMenu(booking.selectedMenu)}</ul>
    <p style="margin-bottom:4px;"><strong>Additional Services</strong></p>
    <ul>${formatServices(booking.additionalServices)}</ul>
    <table style="width:100%; border-collapse:collapse; margin:16px 0; background:#FFF; border-radius:8px;">
      <tr><td style="padding:6px 12px; color:#8A7458;">Total Amount</td><td style="padding:6px 12px; font-weight:bold;">₹${booking.totalAmount}</td></tr>
      <tr><td style="padding:6px 12px; color:#8A7458;">Advance Amount</td><td style="padding:6px 12px;">₹${booking.advanceAmount}</td></tr>
      <tr><td style="padding:6px 12px; color:#8A7458;">Remaining Amount</td><td style="padding:6px 12px;">₹${booking.remainingAmount}</td></tr>
      <tr><td style="padding:6px 12px; color:#8A7458;">Payment Status</td><td style="padding:6px 12px;">${booking.paymentStatus}</td></tr>
      <tr><td style="padding:6px 12px; color:#8A7458;">Booking Status</td><td style="padding:6px 12px;">${booking.bookingStatus}</td></tr>
    </table>
    <p>Please complete the advance payment to lock in your event date.</p>
  `
  );

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: `Your Catering Booking is Confirmed – ${booking.bookingId}`,
    html,
  });
};

/** Sends the payment success email once Razorpay payment is verified. */
const sendPaymentSuccessEmail = async ({ to, customerName, booking, catererName, payment }) => {
  const html = baseWrapper(
    "Payment Successful",
    `
    <p>Hi ${customerName},</p>
    <p>We've received your payment. Thank you!</p>
    <table style="width:100%; border-collapse:collapse; margin:16px 0;">
      <tr><td style="padding:6px 0; color:#8A7458;">Booking ID</td><td style="padding:6px 0; font-weight:bold;">${booking.bookingId}</td></tr>
      <tr><td style="padding:6px 0; color:#8A7458;">Payment ID</td><td style="padding:6px 0;">${payment.razorpayPaymentId}</td></tr>
      <tr><td style="padding:6px 0; color:#8A7458;">Amount Paid</td><td style="padding:6px 0; font-weight:bold;">₹${payment.amount}</td></tr>
      <tr><td style="padding:6px 0; color:#8A7458;">Payment Date</td><td style="padding:6px 0;">${new Date(payment.paidAt || Date.now()).toLocaleString("en-IN")}</td></tr>
      <tr><td style="padding:6px 0; color:#8A7458;">Total Booking Amount</td><td style="padding:6px 0;">₹${booking.totalAmount}</td></tr>
      <tr><td style="padding:6px 0; color:#8A7458;">Remaining Amount</td><td style="padding:6px 0;">₹${booking.remainingAmount}</td></tr>
      <tr><td style="padding:6px 0; color:#8A7458;">Caterer</td><td style="padding:6px 0;">${catererName}</td></tr>
      <tr><td style="padding:6px 0; color:#8A7458;">Event Type</td><td style="padding:6px 0;">${booking.eventType}</td></tr>
      <tr><td style="padding:6px 0; color:#8A7458;">Event Date</td><td style="padding:6px 0;">${new Date(booking.eventDate).toLocaleDateString("en-IN")}</td></tr>
    </table>
    <p style="margin-bottom:4px;"><strong>Selected Menu</strong></p>
    <ul>${formatMenu(booking.selectedMenu)}</ul>
    <p><strong>Payment Status:</strong> COMPLETED &nbsp; | &nbsp; <strong>Booking Status:</strong> CONFIRMED</p>
  `
  );

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: `Payment Successful – Catering Booking ${booking.bookingId}`,
    html,
  });
};

/** Sends a cancellation notice email. */
const sendBookingCancellationEmail = async ({ to, customerName, booking, reason }) => {
  const html = baseWrapper(
    "Booking Cancelled",
    `
    <p>Hi ${customerName},</p>
    <p>Your booking <strong>${booking.bookingId}</strong> has been cancelled.</p>
    ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ""}
    <p>If you've already made a payment, our team will contact you regarding refunds.</p>
  `
  );

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: `Booking Cancelled – ${booking.bookingId}`,
    html,
  });
};

module.exports = {
  sendBookingConfirmationEmail,
  sendPaymentSuccessEmail,
  sendBookingCancellationEmail,
};

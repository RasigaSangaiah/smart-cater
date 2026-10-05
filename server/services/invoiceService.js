const PDFDocument = require("pdfkit");

/**
 * Streams a PDF invoice for a booking directly to the HTTP response.
 * @param {import('express').Response} res
 * @param {object} booking - populated booking (customer, caterer)
 */
const streamInvoicePDF = (res, booking) => {
  const doc = new PDFDocument({ margin: 50, size: "A4" });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=Invoice-${booking.bookingId}.pdf`);
  doc.pipe(res);

  const paprika = "#A6301D";
  const ink = "#1F1B16";
  const grey = "#6B5F53";

  doc.fillColor(paprika).fontSize(22).font("Helvetica-Bold").text("SmartCater", 50, 50);
  doc.fillColor(grey).fontSize(9).font("Helvetica").text("Catering Booking & Management System", 50, 76);

  doc.fillColor(ink).fontSize(16).font("Helvetica-Bold").text("INVOICE", 400, 50, { align: "right" });
  doc.fillColor(grey).fontSize(10).font("Helvetica").text(`Booking ID: ${booking.bookingId}`, 400, 72, { align: "right" });
  doc.text(`Date: ${new Date().toLocaleDateString("en-IN")}`, 400, 86, { align: "right" });

  doc.moveTo(50, 110).lineTo(545, 110).strokeColor("#E4DCCC").stroke();

  doc.fillColor(ink).fontSize(11).font("Helvetica-Bold").text("Billed To", 50, 125);
  doc.fillColor(grey).fontSize(10).font("Helvetica");
  doc.text(booking.customer.name, 50, 142);
  doc.text(booking.customer.email, 50, 156);
  doc.text(booking.customer.phone, 50, 170);

  doc.fillColor(ink).fontSize(11).font("Helvetica-Bold").text("Caterer", 320, 125);
  doc.fillColor(grey).fontSize(10).font("Helvetica");
  doc.text(booking.caterer.name, 320, 142);
  doc.text(booking.caterer.location, 320, 156);
  doc.text(booking.caterer.phone || "", 320, 170);

  doc.moveTo(50, 195).lineTo(545, 195).strokeColor("#E4DCCC").stroke();
  doc.fillColor(ink).fontSize(11).font("Helvetica-Bold").text("Event Details", 50, 208);
  doc.fillColor(grey).fontSize(10).font("Helvetica");
  doc.text(
    `${booking.eventType}  •  ${new Date(booking.eventDate).toLocaleDateString("en-IN")}  •  ${booking.eventTime}  •  ${booking.guestCount} guests`,
    50,
    226
  );
  doc.text(`Venue: ${booking.location}`, 50, 240);

  let y = 275;
  doc.fillColor(ink).fontSize(11).font("Helvetica-Bold").text("Selected Menu", 50, y);
  y += 20;

  doc.fontSize(9).font("Helvetica-Bold").fillColor(grey);
  doc.text("Item", 50, y);
  doc.text("Category", 280, y);
  doc.text("Price/Person", 450, y, { width: 95, align: "right" });
  y += 14;
  doc.moveTo(50, y).lineTo(545, y).strokeColor("#E4DCCC").stroke();
  y += 8;

  doc.font("Helvetica").fillColor(ink);
  booking.selectedMenu.forEach((item) => {
    doc.fontSize(9.5);
    doc.text(item.itemName, 50, y, { width: 220 });
    doc.fillColor(grey).text(item.category, 280, y);
    doc.fillColor(ink).text(`Rs. ${item.pricePerPerson}`, 450, y, { width: 95, align: "right" });
    y += 16;
  });

  if (booking.additionalServices?.length) {
    y += 6;
    doc.fontSize(10).font("Helvetica-Bold").fillColor(ink).text("Additional Services", 50, y);
    y += 16;
    doc.font("Helvetica").fontSize(9.5);
    booking.additionalServices.forEach((s) => {
      doc.fillColor(ink).text(s.name, 50, y, { width: 350 });
      doc.text(`Rs. ${s.price}`, 450, y, { width: 95, align: "right" });
      y += 16;
    });
  }

  y += 15;
  doc.moveTo(50, y).lineTo(545, y).strokeColor("#E4DCCC").stroke();
  y += 15;

  const summaryRow = (label, value, bold = false) => {
    doc.font(bold ? "Helvetica-Bold" : "Helvetica").fontSize(bold ? 11 : 10).fillColor(bold ? ink : grey);
    doc.text(label, 320, y);
    doc.fillColor(ink).text(value, 450, y, { width: 95, align: "right" });
    y += bold ? 18 : 15;
  };

  summaryRow("Price / person", `Rs. ${booking.pricePerPerson}`);
  summaryRow("Food cost", `Rs. ${booking.foodCost.toLocaleString("en-IN")}`);
  summaryRow("Service charges", `Rs. ${booking.serviceCharges.toLocaleString("en-IN")}`);
  summaryRow("Taxes", `Rs. ${booking.taxes.toLocaleString("en-IN")}`);
  y += 4;
  doc.moveTo(320, y).lineTo(545, y).strokeColor("#E4DCCC").stroke();
  y += 8;
  summaryRow("Total Amount", `Rs. ${booking.totalAmount.toLocaleString("en-IN")}`, true);
  summaryRow("Amount Paid", `Rs. ${booking.amountPaid.toLocaleString("en-IN")}`);
  doc.fillColor(paprika).font("Helvetica-Bold").fontSize(11);
  doc.text("Balance Due", 320, y);
  doc.text(`Rs. ${booking.remainingAmount.toLocaleString("en-IN")}`, 450, y, { width: 95, align: "right" });
  y += 25;

  doc.fillColor(grey).font("Helvetica").fontSize(9);
  doc.text(`Payment Status: ${booking.paymentStatus}   |   Booking Status: ${booking.bookingStatus}`, 50, y);

  doc.fontSize(8).fillColor(grey).text(
    "This is a system-generated invoice from SmartCater. For queries, contact support@smartcater.com",
    50,
    770,
    { align: "center", width: 495 }
  );

  doc.end();
};

module.exports = { streamInvoicePDF };
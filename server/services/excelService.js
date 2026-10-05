const ExcelJS = require("exceljs");
const path = require("path");
const fs = require("fs");

const EXCEL_DIR = path.join(__dirname, "..", "..", "excel");
const EXCEL_PATH = path.join(EXCEL_DIR, "CateringOrders.xlsx");

const COLUMNS = [
  { header: "Booking ID", key: "bookingId", width: 14 },
  { header: "Customer", key: "customer", width: 20 },
  { header: "Customer Phone", key: "customerPhone", width: 16 },
  { header: "Caterer", key: "caterer", width: 22 },
  { header: "Event Type", key: "eventType", width: 16 },
  { header: "Event Date", key: "eventDate", width: 14 },
  { header: "Guests", key: "guests", width: 10 },
  { header: "Menu", key: "menu", width: 45 },
  { header: "Additional Services", key: "services", width: 30 },
  { header: "Total Amount", key: "totalAmount", width: 14 },
  { header: "Advance Amount", key: "advanceAmount", width: 16 },
  { header: "Remaining Amount", key: "remainingAmount", width: 18 },
  { header: "Payment Status", key: "paymentStatus", width: 16 },
  { header: "Booking Status", key: "bookingStatus", width: 16 },
  { header: "Created Date", key: "createdDate", width: 18 },
];

/** Ensures the excel folder + workbook with header row exists. Does NOT overwrite existing data. */
const createExcelFile = async () => {
  if (!fs.existsSync(EXCEL_DIR)) {
    fs.mkdirSync(EXCEL_DIR, { recursive: true });
  }

  if (fs.existsSync(EXCEL_PATH)) {
    return EXCEL_PATH; // Already exists - do not recreate/overwrite
  }

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Catering Orders");
  sheet.columns = COLUMNS;
  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFEFE3D8" },
  };

  await workbook.xlsx.writeFile(EXCEL_PATH);
  return EXCEL_PATH;
};

const bookingToRow = (booking) => ({
  bookingId: booking.bookingId,
  customer: booking.customer?.name || "N/A",
  customerPhone: booking.customer?.phone || "N/A",
  caterer: booking.caterer?.name || "N/A",
  eventType: booking.eventType,
  eventDate: new Date(booking.eventDate).toLocaleDateString("en-IN"),
  guests: booking.guestCount,
  menu: (booking.selectedMenu || []).map((m) => m.itemName).join(", "),
  services: (booking.additionalServices || []).map((s) => s.name).join(", "),
  totalAmount: booking.totalAmount,
  advanceAmount: booking.advanceAmount,
  remainingAmount: booking.remainingAmount,
  paymentStatus: booking.paymentStatus,
  bookingStatus: booking.bookingStatus,
  createdDate: new Date(booking.createdAt || Date.now()).toLocaleString("en-IN"),
});

/** Appends ONE new row for a confirmed/created booking. Never creates a new file per order. */
const appendBookingToExcel = async (booking) => {
  await createExcelFile();

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(EXCEL_PATH);
  const sheet = workbook.getWorksheet("Catering Orders");

  sheet.addRow(bookingToRow(booking));

  await workbook.xlsx.writeFile(EXCEL_PATH);
  return EXCEL_PATH;
};

/** Finds the row by Booking ID and updates it in place (e.g. after payment / status change). */
const updateBookingInExcel = async (booking) => {
  if (!fs.existsSync(EXCEL_PATH)) {
    return appendBookingToExcel(booking);
  }

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(EXCEL_PATH);
  const sheet = workbook.getWorksheet("Catering Orders");

  let found = false;
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // header
    if (row.getCell(1).value === booking.bookingId) {
      const updated = bookingToRow(booking);
      COLUMNS.forEach((col, idx) => {
        row.getCell(idx + 1).value = updated[col.key];
      });
      found = true;
    }
  });

  if (!found) {
    sheet.addRow(bookingToRow(booking));
  }

  await workbook.xlsx.writeFile(EXCEL_PATH);
  return EXCEL_PATH;
};

/** Returns the path to the single shared Excel file (used for admin export/download). */
const exportBookings = async () => {
  await createExcelFile();
  return EXCEL_PATH;
};

module.exports = {
  EXCEL_PATH,
  createExcelFile,
  appendBookingToExcel,
  updateBookingInExcel,
  exportBookings,
};

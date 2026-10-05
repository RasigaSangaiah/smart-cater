const path = require("path");
const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const { createExcelFile } = require("./services/excelService");

const app = express();

// --- Security & parsing middleware ---
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: process.env.CLIENT_URL || "*", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --- Routes ---
app.get("/api/health", (req, res) => res.json({ success: true, message: "SmartCater API is running" }));

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/caterers", require("./routes/catererRoutes"));
app.use("/api/menus", require("./routes/menuRoutes"));
app.use("/api/bookings", require("./routes/bookingRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));
app.use("/api/reviews", require("./routes/reviewRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  await createExcelFile(); // ensures excel/CateringOrders.xlsx exists on startup
  app.listen(PORT, () => {
    console.log(`🚀 SmartCater server running on port ${PORT} [${process.env.NODE_ENV || "development"}]`);
  });
};

start();

module.exports = app;

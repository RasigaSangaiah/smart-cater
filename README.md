# SmartCater – Catering Booking & Management System

A full-stack catering booking and management platform for weddings, receptions, birthdays,
corporate events and more. Customers can search caterers, customize menus, see live price
calculations, book events, pay online, and track everything from request to review. Caterers
manage their menu and bookings from a dashboard, and admins oversee the whole platform.

## Tech Stack

**Frontend:** React 18, Vite, Tailwind CSS, React Router, Axios, react-hot-toast, lucide-react
**Backend:** Node.js, Express.js, JWT auth, bcrypt, Nodemailer, Razorpay, ExcelJS
**Database:** MongoDB + Mongoose (MongoDB Atlas recommended)
**Images:** Cloudinary

## Project Structure

```
smart-cater/
├── client/          # React + Vite frontend
├── server/          # Node + Express backend
├── excel/           # CateringOrders.xlsx (auto-generated, one row per booking)
└── README.md
```

## 1. Prerequisites

- Node.js 18+ and npm
- A MongoDB connection string (MongoDB Atlas free tier works fine)
- A Gmail account with an **App Password** for Nodemailer (or another SMTP provider)
- A Razorpay account (test mode keys are fine for development)
- A Cloudinary account (free tier) for image uploads

## 2. Backend Setup

```bash
cd server
npm install
cp .env.example .env
```

Open `.env` and fill in real values:

```
MONGO_URI=your MongoDB connection string
JWT_SECRET=any long random string
EMAIL_USER=your gmail address
EMAIL_PASSWORD=your gmail app password
RAZORPAY_KEY_ID=your Razorpay test key id
RAZORPAY_KEY_SECRET=your Razorpay test key secret
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

Seed the database with demo accounts, caterers, and menu items:

```bash
npm run seed
```

This creates:
- Admin: `admin@smartcater.com` / `admin123`
- Customer: `customer@smartcater.com` / `customer123`
- 3 demo caterers (password `caterer123` for each, already approved)

Start the backend:

```bash
npm run dev
```

The API runs on `http://localhost:5000`. A health check is available at
`GET /api/health`. The Excel file is created automatically at
`../excel/CateringOrders.xlsx` on first run and a new row is appended every
time a booking is confirmed — it is never recreated per order.

## 3. Frontend Setup

In a separate terminal:

```bash
cd client
npm install
npm run dev
```

The app runs on `http://localhost:5173` and proxies `/api` requests to the
backend automatically (see `vite.config.js`).

## 4. Using the App

1. Register as a **customer** to browse and book caterers, or as a **caterer**
   to list your business (your profile needs admin approval before it appears
   publicly — log in as the seeded admin to approve it under **Manage Caterers**).
2. As a customer: search caterers → open a caterer → fill in event details →
   select menu items and optional services → watch the live price breakdown →
   **Confirm Booking**.
3. As the caterer who owns that listing: go to **Bookings** and Accept the
   request. This locks the date, appends a row to `CateringOrders.xlsx`, and
   emails the customer a confirmation.
4. As the customer: open the booking from **My Bookings** and pay the advance
   via Razorpay test checkout (use Razorpay's test card numbers). A payment
   success email is sent automatically and the Excel row is updated.
5. Once the caterer marks the booking **Completed**, the customer can leave a
   star rating and review from the booking details page.

## 5. Key Backend Modules

| Module | Location |
|---|---|
| Auth (register/login/JWT/reset) | `server/controllers/authController.js` |
| Caterer search/profile/CRUD | `server/controllers/catererController.js` |
| Menu CRUD | `server/controllers/menuController.js` |
| Booking lifecycle + double-booking prevention | `server/controllers/bookingController.js` |
| Price calculation (food cost, service charge, tax, advance) | `server/services/pricingService.js` |
| Razorpay order creation + signature verification | `server/controllers/paymentController.js` |
| Single shared Excel file, appended per booking | `server/services/excelService.js` |
| Booking/payment email templates | `server/services/emailService.js` |
| Admin dashboard, approvals, exports | `server/controllers/adminController.js` |

## 6. Notes & Validations Implemented

- Passwords are hashed with bcrypt; JWT protects all private routes with role-based authorization.
- A caterer cannot be double-booked for the same date (`Availability` collection).
- Guest count must be > 0 and event date cannot be in the past.
- Only approved caterers appear in public search results.
- Customers can only review a booking after it is marked **Completed**, and only once.
- Payment amounts are capped at the remaining balance and verified server-side via HMAC signature
  before any booking/payment record is updated.
- `.env` is git-ignored — never commit real credentials.

## 7. Production Notes

This project is built to be functional and beginner-friendly rather than
enterprise-hardened. Before deploying publicly, consider: rate limiting,
refresh tokens, structured logging, automated tests, a proper transactional
email provider, and moving the Excel export to a background job if booking
volume grows large.

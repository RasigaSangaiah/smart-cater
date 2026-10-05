/**
 * Seed script - populates the database with demo users, caterers, and menu items.
 * Run with: npm run seed
 */
const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");
const Caterer = require("../models/Caterer");
const Menu = require("../models/Menu");

const run = async () => {
  await connectDB();

  console.log("Clearing existing demo data...");
  await Promise.all([User.deleteMany({}), Caterer.deleteMany({}), Menu.deleteMany({})]);

  console.log("Creating admin...");
  await User.create({
    name: "Admin",
    email: "admin@smartcater.com",
    phone: "9999999999",
    password: "admin123",
    role: "admin",
  });

  console.log("Creating demo customer...");
  await User.create({
    name: "Arun Kumar",
    email: "customer@smartcater.com",
    phone: "9876543210",
    password: "customer123",
    role: "customer",
  });

  console.log("Creating demo caterers...");
  const caterersData = [
    {
      name: "Sri Annapoorna Catering",
      ownerName: "Karthik Raja",
      email: "sri.catering@smartcater.com",
      phone: "9123456780",
      location: "T Nagar, Chennai",
      city: "Chennai",
      description: "Traditional South Indian catering specialists for weddings and receptions with 15+ years of experience.",
      experience: 15,
      foodType: "veg",
      eventTypes: ["Wedding", "Reception", "Engagement", "Anniversary"],
      pricePerPlate: 350,
      rating: 4.7,
      numReviews: 128,
      approved: true,
    },
    {
      name: "Royal Feast Caterers",
      ownerName: "Anand Prakash",
      email: "royal.feast@smartcater.com",
      phone: "9123456781",
      location: "Anna Nagar, Chennai",
      city: "Chennai",
      description: "Multi-cuisine catering for corporate events and grand celebrations with a professional service team.",
      experience: 10,
      foodType: "both",
      eventTypes: ["Corporate Event", "Birthday", "Wedding", "College Function"],
      pricePerPlate: 450,
      rating: 4.5,
      numReviews: 96,
      approved: true,
    },
    {
      name: "Spice Route Catering Co.",
      ownerName: "Priya Menon",
      email: "spiceroute@smartcater.com",
      phone: "9123456782",
      location: "Adyar, Chennai",
      city: "Chennai",
      description: "Contemporary fusion menus for modern celebrations, known for creative presentation and live counters.",
      experience: 8,
      foodType: "both",
      eventTypes: ["Birthday", "Engagement", "Corporate Event", "Other"],
      pricePerPlate: 500,
      rating: 4.8,
      numReviews: 74,
      approved: true,
    },
  ];

  const createdCaterers = [];
  for (const data of caterersData) {
    const user = await User.create({
      name: data.ownerName,
      email: data.email,
      phone: data.phone,
      password: "caterer123",
      role: "caterer",
    });
    const caterer = await Caterer.create({ ...data, user: user._id });
    createdCaterers.push(caterer);
  }

  console.log("Creating menu items...");
  const menuTemplate = [
    { category: "Welcome Drinks", itemName: "Fresh Fruit Punch", pricePerPerson: 20, foodType: "veg" },
    { category: "Starters", itemName: "Paneer Tikka", pricePerPerson: 45, foodType: "veg" },
    { category: "Starters", itemName: "Chicken 65", pricePerPerson: 55, foodType: "non-veg" },
    { category: "Main Course", itemName: "Veg Biryani", pricePerPerson: 120, foodType: "veg" },
    { category: "Main Course", itemName: "Chicken Biryani", pricePerPerson: 150, foodType: "non-veg" },
    { category: "Rice", itemName: "Jeera Rice", pricePerPerson: 40, foodType: "veg" },
    { category: "Breads", itemName: "Butter Naan", pricePerPerson: 25, foodType: "veg" },
    { category: "Side Dishes", itemName: "Paneer Butter Masala", pricePerPerson: 60, foodType: "veg" },
    { category: "Desserts", itemName: "Gulab Jamun", pricePerPerson: 30, foodType: "veg" },
    { category: "Ice Cream", itemName: "Vanilla Ice Cream", pricePerPerson: 25, foodType: "veg" },
    { category: "Beverages", itemName: "Masala Chaas", pricePerPerson: 15, foodType: "veg" },
    { category: "Special Items", itemName: "Live Chaat Counter", pricePerPerson: 50, foodType: "veg" },
  ];

  for (const caterer of createdCaterers) {
    const items = menuTemplate.map((item) => ({ ...item, caterer: caterer._id, isAvailable: true }));
    await Menu.insertMany(items);
  }

  console.log("✅ Seed complete!");
  console.log("Admin login: admin@smartcater.com / admin123");
  console.log("Customer login: customer@smartcater.com / customer123");
  console.log("Caterer logins: sri.catering@smartcater.com / caterer123 (etc.) ");

  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

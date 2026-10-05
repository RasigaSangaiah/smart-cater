/**
 * Change any user's password by email, WITHOUT touching any other data.
 * Usage: node utils/changeAdminPassword.js user@email.com YourNewStrongPassword123!
 * Example: node utils/changeAdminPassword.js admin@smartcater.com MyStr0ng!Pass2026
 */
const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");

const run = async () => {
  const email = process.argv[2];
  const newPassword = process.argv[3];

  if (!email || !newPassword || newPassword.length < 8) {
    console.error("❌ Usage: node utils/changeAdminPassword.js <email> <newPassword>");
    console.error("   Example: node utils/changeAdminPassword.js sri.catering@smartcater.com MyStr0ng!Pass2026");
    console.error("   Password must be at least 8 characters.");
    process.exit(1);
  }

  await connectDB();

  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

  if (!user) {
    console.error(`❌ No user found with email: ${email}`);
    process.exit(1);
  }

  user.password = newPassword; // pre-save hook in User model will hash it
  await user.save();

  console.log("✅ Password updated successfully!");
  console.log(`   Name: ${user.name}`);
  console.log(`   Email: ${user.email}`);
  console.log(`   Role: ${user.role}`);
  console.log(`   New password: ${newPassword}`);
  console.log("   (All other data was left untouched.)");

  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
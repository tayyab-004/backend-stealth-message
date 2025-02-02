const mongoose = require("mongoose");
const dotenv = require("dotenv");
const readline = require("readline");
const User = require("../models/User");

// Load environment variables
dotenv.config();

// Create a readline interface to prompt for input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Helper function to ask a question and wait for the answer
const askQuestion = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer.trim()));
  });
};

const seedSuperAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected for seeding Super Admin...\n");

    // Prompt the user for Super Admin credentials and details
    const email = await askQuestion("Enter Super Admin Email: ");
    const password = await askQuestion("Enter Super Admin Password: ");
    const firstName = await askQuestion("Enter Super Admin First Name: ");
    const lastName = await askQuestion("Enter Super Admin Last Name: ");
    const location = await askQuestion("Enter Super Admin Location: ");

    // Check if a Super Admin with this email already exists
    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
      console.log(`\nSuper Admin already exists with email: ${email}`);
      rl.close();
      process.exit();
    }

    // Create a new Super Admin user
    const superAdmin = new User({
      firstName,
      lastName,
      email,
      password,
      location,
      checkBoxNotice: true,
      contactBoxMarketing: true,
      role: "super-admin",
    });

    await superAdmin.save();
    console.log(`\nSuper Admin created successfully: ${superAdmin.email}`);

    rl.close();
    process.exit();
  } catch (error) {
    console.error("\nError seeding Super Admin:", error);
    rl.close();
    process.exit(1);
  }
};

seedSuperAdmin();

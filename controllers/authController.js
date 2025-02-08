const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// register controller
exports.registerUser = async (req, res) => {
  console.log("Received Data: ", req.body);
  const {
    firstName,
    lastName,
    email,
    password,
    location,
    checkBoxNotice,
    contactBoxMarketing = false,
    role,
  } = req.body;

  try {
    if (checkBoxNotice === false) {
      return res.status(400).json({ message: "Please check both boxes!" });
    }

    // reject to create admins account if user role
    if (role && role !== "user") {
      return res.status(403).json({
        message: "Admin accounts can only be created via the admin endpoint.",
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists!" });
    }

    const user = new User({
      firstName,
      lastName,
      email,
      password,
      location,
      checkBoxNotice,
      contactBoxMarketing,
      role: "user",
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    res.status(201).json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// login controller
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 3600000,
    });

    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Logout user
exports.logoutUser = async (req, res) => {
  res.clearCookie("token").json({
    success: true,
    message: "Logout Successfully!",
  });
};

// Auth middleware
exports.authMiddleware = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized User!",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Unauthorized User!",
    });
  }
};

// create admin controller
exports.createAdmin = async (req, res) => {
  const { firstName, lastName, email, password, location, role } = req.body;

  // Allowed admin roles
  const allowedRoles = ["super-admin", "support-admin", "engagement-admin"];
  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ message: "Invalid admin role" });
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists!" });
    }

    const adminUser = new User({
      firstName,
      lastName,
      email,
      password,
      location,
      checkBoxNotice: true,
      contactBoxMarketing: true,
      role,
    });

    await adminUser.save();

    res.status(201).json({
      message: `${role} created successfully!`,
      user: {
        _id: adminUser._id,
        firstName: adminUser.firstName,
        lastName: adminUser.lastName,
        email: adminUser.email,
        role: adminUser.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update admin details (Only super-admin)
exports.updateAdmin = async (req, res) => {
  try {
    const { email, newPassword, newRole } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "Admin not found" });
    }

    if (newPassword) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    if (newRole) {
      user.role = newRole;
    }

    await user.save();

    res.status(200).json({ message: "Admin updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

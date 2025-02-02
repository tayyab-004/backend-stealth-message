const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  logoutUser,
  authMiddleware,
  createAdmin,
} = require("../controllers/authController");
const { requireRole } = require("../middleware/roleMiddleware");

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected routes
router.post("/logout", logoutUser);
router.get("/check-auth", authMiddleware, (req, res) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    message: "Authenticated User!",
    user,
  });
});
// only super-admin can access create-admin route
router.post(
  "/create-admin",
  authMiddleware,
  requireRole("super-admin"),
  createAdmin
);

module.exports = router;

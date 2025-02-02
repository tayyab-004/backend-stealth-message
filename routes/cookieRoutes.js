const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  const necessary = req.cookies.necessary_cookies;
  const preferences = req.cookies.preference_cookies;

  res.json({
    necessary: necessary === "true",
    preferences: preferences === "true",
  });
});

router.post("/", (req, res) => {
  const { necessary, preferences } = req.body;

  res.cookie("necessary_cookies", necessary, {
    maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
  });

  res.cookie("preference_cookies", preferences, {
    maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
  });

  res.json({ success: true });
});

module.exports = router;

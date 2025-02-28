const express = require("express");
const { getUser } = require("../controllers/userController");
const router = express.Router();

router.get("/me", getUser);
router.post("/me", getUser);

module.exports = router;
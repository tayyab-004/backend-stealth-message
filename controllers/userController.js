const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.getUser = async (req, res) => {
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
        res.status(400).json({
            success: false,
            message: "User not authorized"
        })
    }

    try {
        const user = jwt.verify(accessToken, process.env.JWT_SECRET);
        res.status(200).json({
            success: true,
            message: "User found",
            user
        })
    } catch (error) {
        res.status(401).json({
            success: false,
            message: "Unauthorized Token!",
        });
    }
}
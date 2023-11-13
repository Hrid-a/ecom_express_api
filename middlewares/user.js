const apiPromise = require("./apiPromise");
const User = require("../models/user");
const jwt = require('jsonwebtoken');
const CustomError = require('../utils/CustomError');

exports.isLoggedIn = apiPromise(async (req, res, next) => {
    const token = req.cookies.token || req.headers?.Authorization?.replace("Bearer ", "");
    if (!token) return next(new CustomError("Please sign in first", 400));

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    const user = await User.findById(decoded.id);
    if (!user) return next(new CustomError("User not found", 400));
    req.user = user;
    next();
});

exports.isAdmin = (req, res, next) => {
    if (req.user.role !== "admin") return next(new CustomError("You are not allowed to access this page", 401));

    next();
};
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');

const authMiddleware = asyncHandler(async (req, res, next) => {
    let token;

    // STEP 1 — Check if Authorization header exists and starts with Bearer
    // Header format is always: "Bearer eyJhbGciOiJIUzI1NiJ9..."
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {

        try {
            // STEP 2 — Extract token from header
            // "Bearer eyJhbG..." → split on space → take index 1
            token = req.headers.authorization.split(' ')[1];

            // STEP 3 — Verify token
            // jwt.verify throws automatically if tampered or expired
            // decoded contains whatever you put in jwt.sign() — in your case { id }
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // STEP 4 — Fetch user from DB using id from token
            // .select('-password') — password hash never leaves the DB layer
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({ message: 'User no longer exists' });
            }

            // STEP 5 — Pass control to the actual controller
           return next();

        } catch (error) {
            // jwt.verify threw — token is invalid or expired
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    // No token in header at all
    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
});

module.exports = authMiddleware;
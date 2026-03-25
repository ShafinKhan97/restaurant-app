const rateLimit = require('express-rate-limit');

// 1. Global Limiter (Apply to all requests as fallback)
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 1000 requests per 15 minutes
    message: { success: false, message: "Too many requests from this IP, please try again after 15 minutes" },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// 2. Auth Limiter (Apply to Auth routes)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 login/registration attempts per 15 mins
    message: { success: false, message: "Too many login/registration attempts, please try again after 15 minutes" },
    standardHeaders: true,
    legacyHeaders: false,
});

// 3. Upload Limiter (Apply to Image storage routes)
const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 30, // Limit to 30 images per hour
    message: { success: false, message: "Upload limit reached. Please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
});

// 4. Mutation Limiter (Apply to POST/PUT/DELETE for restaurants, menus, etc.)
const mutationLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 60, // Limit each IP to 60 mutations per minute
    message: { success: false, message: "Too many actions performed, please wait a minute." },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    globalLimiter,
    authLimiter,
    uploadLimiter,
    mutationLimiter
};

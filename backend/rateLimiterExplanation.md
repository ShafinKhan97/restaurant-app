# Rate Limiter Implementation Details

This document explains the implementation of rate limiting in our application, the problems it solves, its scope, and a detailed breakdown of the code.

## 1. What Problem Is Rate Limiting Solving?
Unrestricted APIs are vulnerable to various types of abuse:
- **Brute-Force Attacks & Credential Stuffing:** Malicious bots continuously guessing passwords or verification PINs.
- **Resource Exhaustion (DDoS Validation):** Attackers spamming heavy endpoints (like image uploads or complex database queries) to slow down or crash the server.
- **Cost Overruns:** Hitting third-party services (like sending SMS/emails via standard APIs) excessively can quickly drain a company's budget.

Rate limiting solves this by placing a strict cap on how many requests a single IP address can make to specific endpoints within a certain time window.

## 2. Purpose and Scope
**Purpose:** Ensure the backend remains secure, responsive, and available to legitimate users while automatically blocking suspicious, high-frequency request patterns.
**Scope:** Applied specifically via the `express-rate-limit` middleware across the entire application, with customized strictness depending on the sensitivity of the route.

## 3. Where Is It Used?
The rate limiter logic is centralized in `backend/middleware/rateLimiter.js`. We apply these limiters in several places:
- **`backend/server.js`:** Applies the `globalLimiter` as a safety net over the entire app.
- **`backend/routes/authRoutes.js`:** Applies the highly restrictive `authLimiter` to protect login, signup, password resets, and email verifications.
- **`backend/routes/imageAssetRoutes.js`:** Applies `uploadLimiter` specifically to `POST` and `PUT` upload endpoints.
- **`backend/routes/restaurantRoutes.js` & `backend/routes/menuItemRoutes.js`:** Applies `mutationLimiter` to all data modification endpoints (`POST`, `PUT`, `DELETE`).

## 4. Code Explanation (Line-by-Line)

### Global Setup & Configuration
```javascript
const rateLimit = require('express-rate-limit');
```
- Imports the `express-rate-limit` library to create configurable middleware functions that block excessive requests.

---

### Global Limiter
```javascript
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 1000, 
    message: { success: false, message: "Too many requests from this IP, please try again after 15 minutes" },
    standardHeaders: true, 
    legacyHeaders: false, 
});
```
- `windowMs`: Sets the time window for tracking requests to 15 minutes (in milliseconds).
- `max`: Limits each IP to 1,000 total requests across the entire application during that 15-minute window.
- `message`: The JSON payload sent back to the user when they exceed 1,000 requests.
- `standardHeaders`: Tells the middleware to return standard `RateLimit-*` headers in the HTTP response (informing the client how many requests they have left).
- `legacyHeaders`: Disables the older, deprecated `X-RateLimit-*` headers to keep response payload clean.

---

### Authentication Limiter
```javascript
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 10, 
    message: { success: false, message: "Too many login/registration attempts, please try again after 15 minutes" },
    standardHeaders: true,
    legacyHeaders: false,
});
```
- `windowMs`: A 15-minute timeframe.
- `max`: Allows only 10 requests per IP hitting authentication endpoints. This completely stops brute-force password guessing bots.
- `message`: Displays a targeted error message concerning login/registration.

---

### Image Upload Limiter
```javascript
const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 30, 
    message: { success: false, message: "Upload limit reached. Please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
});
```
- `windowMs`: Extended to 1 hour (`60 * 60 * 1000`).
- `max`: Caps image uploads at 30 per hour. Uploading images costs server memory, CPU time, and cloud storage. Capping this prevents a single user from dumping thousands of junk images into your S3 bucket.

---

### Mutation Limiter
```javascript
const mutationLimiter = rateLimit({
    windowMs: 60 * 1000, 
    max: 60, 
    message: { success: false, message: "Too many actions performed, please wait a minute." },
    standardHeaders: true,
    legacyHeaders: false,
});
```
- `windowMs`: A short 1-minute window.
- `max`: 60 requests allowed per minute. Protects Database `INSERT`, `UPDATE`, and `DELETE` operations (creating restaurants/menu items). Prevents rapid-fire database writes from spam bots.

---

### Exporting Middleware
```javascript
module.exports = {
    globalLimiter,
    authLimiter,
    uploadLimiter,
    mutationLimiter
};
```
- Packages and exports all configured limiters so they can be securely imported explicitly by any route file requiring specific, targeted rate-limiting.

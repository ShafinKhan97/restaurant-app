const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const path = require("path");

dotenv.config();
connectDB();

const app = express();

// Middleware
app.set("trust proxy", 1);
const { globalLimiter } = require("./middleware/rateLimiter");
app.use(globalLimiter);
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static Folder for Uploads (Fallback for local storage)
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/restaurants", require("./routes/restaurantRoutes"));
app.use(
  "/api/restaurants/:restaurantId/menu-items",
  require("./routes/menuItemRoutes")
);
app.use(
  "/api/restaurants/:restaurantId/menu-items/:menuItemId/image-assets",
  require("./routes/imageAssetRoutes")
);
app.use("/api/menu", require("./routes/menuRoutes"));

// Health check
app.get("/", (req, res) => {
  res.json({ message: "Restaurant App API is running" });
});

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Internal server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

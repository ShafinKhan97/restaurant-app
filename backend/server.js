const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

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

const express = require("express");
const app = express();
const connectDB = require("./config/database");
const cloud = require("./config/cloudinary");
const authRoutes = require("./Routes/route");
const path = require("path");
require("dotenv").config();

const cors = require("cors");

// Connect to MongoDB
connectDB();

// Connect to cloudinary
cloud.connectCloudinary();

// CORS: allow all origins for local testing, but still support credentials (cookies)
const corsOptions = {
  origin: "https://skill-swap-across.vercel.app", // reflect the request origin
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Serve uploaded videos statically with absolute path
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// for 
const cookieParser = require("cookie-parser");
app.use(cookieParser());

// Optional: Force correct MIME type if filename lacks extension
app.get("/uploads/:fileKey", (req, res) => {
  const filePath = path.join(__dirname, "uploads", req.params.fileKey);
  res.type("video/mp4");
  res.sendFile(filePath);
});


// Routes
app.use("/auth", authRoutes);

// Catch-all for unknown /auth routes
app.use("/auth", (req, res) => {
  return res.status(404).json({ message: "Not found" });
});

// Test route
app.get("/", (req, res) => {
  res.send("Hello e");
});

const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

// Increase timeout to 20 minutes (matching JWT expiration - 20 minutes)
server.timeout = 20 * 60 * 1000; // 20 minutes in milliseconds
server.keepAliveTimeout = 20 * 60 * 1000; // 20 minutes
server.headersTimeout = 21 * 60 * 1000; // 21 minutes (should be greater than keepAliveTimeout)

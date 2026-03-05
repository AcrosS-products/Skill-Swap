// models/TeachContent.js
const mongoose = require("mongoose");

const teachContentSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  description: { type: String, default: "" },
  type: { type: String, enum: ["link","video"], required: true },
  url: { type: String, required: true },
  meta: { type: mongoose.Schema.Types.Mixed },  // optional: store full Cloudinary response
}, { timestamps: true });

// Add index for fast queries (by owner, then createdAt desc)
teachContentSchema.index({ owner: 1, createdAt: -1 });

module.exports = mongoose.model("TeachContent", teachContentSchema);

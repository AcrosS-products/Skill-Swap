const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema(
  {
    owner: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    tags: {
      type: String,
      trim: true,
    },

    type: { 
      type: String, 
      enum: ["video", "link"], 
      required: true 
    },

    fileURL: {
      type: String,
      required: true,
    },

    fileKey: { 
      type: String 
    },               

    mimeType: { 
      type: String 
    },            

    sizeBytes: { 
      type: Number 
    },           
  },
  { timestamps: true }
);

module.exports = mongoose.model("File", fileSchema);
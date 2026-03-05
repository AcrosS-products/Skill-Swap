const mongoose = require("mongoose");

const learningRequestSchema = new mongoose.Schema(
  {
    learner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tutor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    skill: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "cancelled"],
      default: "pending",
    },
    scheduledDate: {
      type: Date,
    },
    duration: {
      type: Number, // in minutes
      default: 60,
    },
  },
  {
    timestamps: true,
    collection: "learning_requests",
  }
);

// Index for faster queries
learningRequestSchema.index({ tutor: 1, status: 1 });
learningRequestSchema.index({ learner: 1, status: 1 });

module.exports = mongoose.model("LearningRequest", learningRequestSchema);


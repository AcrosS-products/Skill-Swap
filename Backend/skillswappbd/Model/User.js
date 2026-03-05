const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  skills: [{ type: String }],

  requestsRaised: [
    { type: mongoose.Schema.Types.ObjectId, ref: "LearningRequest" }
  ],

  requestsReceived: [
    { type: mongoose.Schema.Types.ObjectId, ref: "LearningRequest" }
  ],

  // FINAL CONTENT FIELD (ONLY URLS)
  content: [
    {
      title: { type: String, required: true },
      description: { type: String, required: true},
      type: { type: String, enum: ["file", "link"], required: true },
      url: { type: String, required: true },
      uploadedAt: { type: Date, default: Date.now }
    }
  ]

});

module.exports = mongoose.model("User", userSchema);

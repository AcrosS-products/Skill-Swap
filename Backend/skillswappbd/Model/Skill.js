const mongoose = require("mongoose");

const skillSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  tutors: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
},  { collection: "skills" });

module.exports = mongoose.model("Skill", skillSchema);

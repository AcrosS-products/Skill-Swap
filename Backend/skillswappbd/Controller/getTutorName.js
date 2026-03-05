const express = require("express");
const User = require("../Model/User"); // adjust path as needed

// GET /tutor-name/:id
const getTutorName = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("name");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ name: user.name });
  } catch (err) {
    console.error("Error fetching user name:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = getTutorName;
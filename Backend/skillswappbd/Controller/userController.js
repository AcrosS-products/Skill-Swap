const User = require("../Model/User");
const { Types: { ObjectId } } = require("mongoose");

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id; // From JWT token
    
    const user = await User.findById(userId).select("-password");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.status(200).json({ user });
  } catch (err) {
    console.error("Error fetching user profile:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get user by ID (for viewing other users)
const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const user = await User.findById(userId).select("-password");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.status(200).json({ user });
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get user skills (skills user can teach)
const getUserSkills = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.status(200).json({ skills: user.skills || [] });
  } catch (err) {
    console.error("Error fetching user skills:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Remove skill from user
const removeSkill = async (req, res) => {
  try {
    const userId = req.user.id;
    const { skill } = req.body;
    
    if (!skill) {
      return res.status(400).json({ message: "Skill name is required" });
    }
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Remove skill from user
    user.skills = user.skills.filter(s => s !== skill);
    await user.save();
    
    // Remove user from skill's tutors list
    const Skill = require("../Model/Skill");
    await Skill.updateOne(
      { name: skill },
      { $pull: { tutors: userId } }
    );
    
    res.status(200).json({ 
      message: "Skill removed successfully",
      skills: user.skills 
    });
  } catch (err) {
    console.error("Error removing skill:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Update user profile (name)
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name } = req.body;
    
    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Name is required" });
    }
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    user.name = name.trim();
    await user.save();
    
    res.status(200).json({ 
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      }
    });
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  getUserProfile,
  getUserById,
  getUserSkills,
  removeSkill,
  updateProfile
};


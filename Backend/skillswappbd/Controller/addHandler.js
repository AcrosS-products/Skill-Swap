const mongoose = require('mongoose');
const { Types: { ObjectId } } = mongoose;
const User = require('../Model/User');
const Skill = require('../Model/Skill');

const addHandler = async (req, res) => {
  const { userId } = req.params;
  const { skill } = req.body;

  if (!skill) return res.status(400).json({ message: 'Skill is required' });
  // Validate ObjectId strictly
  if (!ObjectId.isValid(userId) || new ObjectId(userId).toString() !== userId) {
    return res.status(400).json({ message: 'Invalid userId' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Upsert skill and add user as tutor (idempotent)
    const skillDoc = await Skill.findOneAndUpdate(
      { name: skill },
      { $addToSet: { tutors: user._id } },
      { new: true, upsert: true }
    );

    // Push into user.skills appropriately:
    // - If you store names: push the string
    // - If you store refs: push skillDoc._id
    // Example below assumes names; switch to skillDoc._id if skills is ObjectId[]
    if (!user.skills.includes(skill)) {
      user.skills.push(skill); // or skillDoc._id if ref
      await user.save();
    }

    return res.status(200).json({ message: 'Skill added successfully', user, skill: skillDoc });
  } catch (err) {
    // Helpful branching for common DB errors
    if (err && err.code === 11000) {
      return res.status(409).json({ message: 'Duplicate skill constraint', error: err.message });
    }
    return res.status(500).json({ message: 'Error adding skill', error: err.message });
  }
};

module.exports = addHandler;

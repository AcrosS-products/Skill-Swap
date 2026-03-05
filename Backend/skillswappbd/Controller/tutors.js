const mongoose = require('mongoose');
const Skill = require("../Model/Skill"); // Make sure the model name matches

const tutor = async (req, res) => {
    try {
        // Populate tutors to ensure referenced users exist, but only return _id
        const skills = await Skill.find().populate("tutors", "_id");

        const output = skills.map((skill) => ({
            _id: skill._id,
            id: skill._id,
            name: skill.name,
            // Filter out null/invalid references, return plain ids as strings
            tutors: Array.isArray(skill.tutors)
                ? skill.tutors.filter(Boolean).map((u) => u._id)
                : [],
        }));

        res.status(200).json({
            message: "All users found",
            output,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Error fetching data",
            error: err.message,
        });
    }
}

module.exports = tutor;

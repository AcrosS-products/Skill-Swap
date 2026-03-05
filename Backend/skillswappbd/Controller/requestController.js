const LearningRequest = require("../Model/LearningRequest");
const User = require("../Model/User");
const Skill = require("../Model/Skill");
const {
  Types: { ObjectId },
} = require("mongoose");

// Create a learning request
const createRequest = async (req, res) => {
  try {
    const learnerId = req.user.id;
    const { tutorId, skill, message, scheduledDate, duration } = req.body;

    if (!tutorId || !skill) {
      return res
        .status(400)
        .json({ message: "Tutor ID and skill are required" });
    }

    // Check if tutor exists
    const tutor = await User.findById(tutorId);
    if (!tutor) {
      return res.status(404).json({ message: "Tutor not found" });
    }

    // Check if tutor teaches this skill
    if (!tutor.skills || !tutor.skills.includes(skill)) {
      return res
        .status(400)
        .json({ message: "Tutor does not teach this skill" });
    }

    // Check if request already exists
    const existingRequest = await LearningRequest.findOne({
      learner: learnerId,
      tutor: tutorId,
      skill,
      status: "pending",
    });

    if (existingRequest) {
      return res.status(400).json({
        message:
          "You already have a pending request for this skill with this tutor",
      });
    }

    // Create request
    const request = await LearningRequest.create({
      learner: learnerId,
      tutor: tutorId,
      skill,
      message: message || "",
      scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined,
      duration: duration || 60,
    });

    // ✅ Add references to both users
    await Promise.all([
      User.findByIdAndUpdate(learnerId, {
        $push: { requestsRaised: request._id },
      }),
      User.findByIdAndUpdate(tutorId, {
        $push: { requestsReceived: request._id },
      }),
    ]);

    const populatedRequest = await LearningRequest.findById(request._id)
      .populate("learner", "name email")
      .populate("tutor", "name email skills");

    res.status(201).json({
      message: "Learning request created successfully",
      request: populatedRequest,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get tutor's incoming requests
const getTutorRequests = async (req, res) => {
  try {
    const tutorId = req.user.id;
    const { status } = req.query;

    let query = { tutor: tutorId };
    if (status && ["pending", "accepted", "rejected", "cancelled"].includes(status)) {
      query.status = status;
    }

    const requests = await LearningRequest.find(query)
      .populate("learner", "name email skills")
      .populate("tutor", "name email skills")
      .sort({ createdAt: -1 });

    res.status(200).json({ requests });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get learner's outgoing requests
const getLearnerRequests = async (req, res) => {
  try {
    const learnerId = req.user.id;
    const { status } = req.query;
    let query = { learner: learnerId };
    if (status && ["pending", "accepted", "rejected", "cancelled"].includes(status)) {
      query.status = status;
    }

    const requests = await LearningRequest.find(query)
      .populate("learner", "name email")
      .populate("tutor", "name email skills")
      .sort({ createdAt: -1 });

    res.status(200).json({ requests });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Accept a request
const acceptRequest = async (req, res) => {
  try {
    const tutorId = req.user.id;
    const { requestId } = req.params;

    const request = await LearningRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.tutor.toString() !== tutorId) {
      return res
        .status(403)
        .json({ message: "Not authorized to accept this request" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ message: "Request is not pending" });
    }

    request.status = "accepted";
    await request.save();

    // Create a learning session
    const LearningSession = require("../Model/LearningSession");
    await LearningSession.create({
      learner: request.learner,
      tutor: request.tutor,
      skill: request.skill,
      status: "pending",
      notes: request.message,
    });

    const populatedRequest = await LearningRequest.findById(request._id)
      .populate("learner", "name email")
      .populate("tutor", "name email skills");

    res.status(200).json({
      message: "Request accepted successfully",
      request: populatedRequest,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Reject a request
const rejectRequest = async (req, res) => {
  try {
    const tutorId = req.user.id;
    const { requestId } = req.params;
    const { reason } = req.body;

    const request = await LearningRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.tutor.toString() !== tutorId) {
      return res
        .status(403)
        .json({ message: "Not authorized to reject this request" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ message: "Request is not pending" });
    }

    request.status = "rejected";
    if (reason) {
      request.message += ` [Rejection reason: ${reason}]`;
    }
    await request.save();

    const populatedRequest = await LearningRequest.findById(request._id)
      .populate("learner", "name email")
      .populate("tutor", "name email skills");

    res.status(200).json({
      message: "Request rejected",
      request: populatedRequest,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Cancel a request (learner can cancel)
const cancelRequest = async (req, res) => {
  try {
    const learnerId = req.user.id;
    const { requestId } = req.params;

    const request = await LearningRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.learner.toString() !== learnerId) {
      return res
        .status(403)
        .json({ message: "Not authorized to cancel this request" });
    }

    if (request.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Only pending requests can be cancelled" });
    }

    request.status = "cancelled";
    await request.save();

    // ✅ Remove references from both users
    await Promise.all([
      User.findByIdAndUpdate(learnerId, {
        $pull: { requestsRaised: request._id },
      }),
      User.findByIdAndUpdate(request.tutor, {
        $pull: { requestsReceived: request._id },
      }),
    ]);

    res.status(200).json({
      message: "Request cancelled successfully",
      request,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get all skills with tutor count
const getAllSkillsWithTutors = async (req, res) => {
  try {
    const skills = await Skill.find()
      .populate("tutors", "name email skills")
      .sort({ name: 1 });

    const skillsWithCount = skills.map((skill) => ({
      _id: skill._id,
      id: skill._id,
      name: skill.name,
      tutors: skill.tutors || [],
      tutorCount: skill.tutors ? skill.tutors.length : 0,
    }));

    res.status(200).json({
      message: "Skills retrieved successfully",
      output: skillsWithCount,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  createRequest,
  getTutorRequests,
  getLearnerRequests,
  acceptRequest,
  rejectRequest,
  cancelRequest,
  getAllSkillsWithTutors,
};

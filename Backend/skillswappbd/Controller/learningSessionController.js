const LearningSession = require("../Model/LearningSession");
const User = require("../Model/User");

// Create a new learning session
const createSession = async (req, res) => {
  try {
    const learnerId = req.user.id;
    const { tutorId, skill } = req.body;

    if (!tutorId || !skill) {
      return res.status(400).json({ message: "Tutor ID and skill are required" });
    }

    // Check if tutor exists
    const tutor = await User.findById(tutorId);
    if (!tutor) {
      return res.status(404).json({ message: "Tutor not found" });
    }

    // Check if tutor teaches this skill
    if (!tutor.skills || !tutor.skills.includes(skill)) {
      return res.status(400).json({ message: "Tutor does not teach this skill" });
    }

    // Create session
    const session = await LearningSession.create({
      learner: learnerId,
      tutor: tutorId,
      skill,
      status: "pending",
    });

    const populatedSession = await LearningSession.findById(session._id)
      .populate("learner", "name email")
      .populate("tutor", "name email skills");

    res.status(201).json({
      message: "Learning session created successfully",
      session: populatedSession,
    });
  } catch (err) {
    console.error("Error creating session:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get user's learning sessions
const getUserSessions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;

    let query = {
      $or: [{ learner: userId }, { tutor: userId }],
    };

    if (status) {
      query.status = status;
    }

    const sessions = await LearningSession.find(query)
      .populate("learner", "name email")
      .populate("tutor", "name email skills")
      .sort({ createdAt: -1 });

    res.status(200).json({ sessions });
  } catch (err) {
    console.error("Error fetching sessions:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Update session status
const updateSessionStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { sessionId } = req.params;
    const { status, notes } = req.body;

    const session = await LearningSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Check if user is part of this session
    if (
      session.learner.toString() !== userId &&
      session.tutor.toString() !== userId
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (status) {
      session.status = status;
      if (status === "active") {
        session.startDate = new Date();
      } else if (status === "completed") {
        session.endDate = new Date();
      }
    }

    if (notes) {
      session.notes = notes;
    }

    await session.save();

    const populatedSession = await LearningSession.findById(session._id)
      .populate("learner", "name email")
      .populate("tutor", "name email skills");

    res.status(200).json({
      message: "Session updated successfully",
      session: populatedSession,
    });
  } catch (err) {
    console.error("Error updating session:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Rate and review session
const rateSession = async (req, res) => {
  try {
    const userId = req.user.id;
    const { sessionId } = req.params;
    const { rating, review } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const session = await LearningSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Only learner can rate
    if (session.learner.toString() !== userId) {
      return res.status(403).json({ message: "Only learner can rate sessions" });
    }

    if (session.status !== "completed") {
      return res.status(400).json({ message: "Can only rate completed sessions" });
    }

    session.rating = rating;
    session.review = review || "";

    await session.save();

    res.status(200).json({
      message: "Session rated successfully",
      session,
    });
  } catch (err) {
    console.error("Error rating session:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  createSession,
  getUserSessions,
  updateSessionStatus,
  rateSession,
};


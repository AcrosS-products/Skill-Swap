const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ---------- Controllers ----------
const signupHandler = require("../Controller/signupController");
const loginHandler = require("../Controller/loginController");
const tutors = require("../Controller/tutors");
const addHandler = require("../Controller/addHandler");
const authenticateToken = require("../Middlewares/authMiddleware");
const getTutorName = require("../Controller/getTutorName");

// Messaging controllers
const {
  sendMessage,
  getConversation,
  getAllConversations,
  markAsRead,
  getUnreadCount,
} = require("../Controller/messageHandler");

//Save metadata
// const { saveRemote } = require("../Controller/saveRemote");

// User controllers
const {
  getUserProfile,
  getUserById,
  getUserSkills,
  removeSkill,
  updateProfile,
} = require("../Controller/userController");

// Learning Session controllers
const {
  createSession,
  getUserSessions,
  updateSessionStatus,
  rateSession,
} = require("../Controller/learningSessionController");

// Learning Request controllers
const {
  createRequest,
  getTutorRequests,
  getLearnerRequests,
  acceptRequest,
  rejectRequest,
  cancelRequest,
  getAllSkillsWithTutors,
} = require("../Controller/requestController");

// Typing controller
const { setTyping, getTyping } = require("../Controller/typingController");
const Message = require("../Model/Message");

// ---------- Auth routes ----------
router.post("/login", loginHandler);
router.post("/signup", signupHandler);

// ---------- Tutor routes ----------
router.get("/learn", tutors);
router.get("/tutorname/:id", authenticateToken, getTutorName);

// ---------- Add skill route ----------
router.post("/add-skill/:userId", addHandler);

// ---------- Protected dashboard ----------
router.get("/dashboard", authenticateToken, (req, res) => {
  res.send(`Welcome ${req.user.email}, your session expires in 1 minute!`);
});

// ---------- Messaging routes ----------
router.post("/messages/send", authenticateToken, sendMessage);
router.get("/messages/conversations", authenticateToken, getAllConversations);
router.get("/messages/conversation/:userId", authenticateToken, getConversation);
router.patch("/messages/read/:userId", authenticateToken, markAsRead);
router.get("/messages/unread-count", authenticateToken, getUnreadCount);

// ---------- Typing indicator routes ----------
router.post("/messages/typing/:userId", authenticateToken, (req, res) => {
  try {
    const currentUserId = req.user.id;
    const { userId } = req.params;
    const conversationId = Message.getConversationId(currentUserId, userId);
    setTyping(currentUserId, conversationId);
    res.status(200).json({ message: "Typing indicator set" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.get("/messages/typing/:userId", authenticateToken, (req, res) => {
  try {
    const currentUserId = req.user.id;
    const { userId } = req.params;
    const conversationId = Message.getConversationId(currentUserId, userId);
    const typing = getTyping(conversationId, currentUserId);
    res.status(200).json({ typing });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ---------- User routes ----------
router.get("/user/profile", authenticateToken, getUserProfile);
router.get("/user/:userId", authenticateToken, getUserById);
router.get("/user/skills", authenticateToken, getUserSkills);
router.delete("/user/skill", authenticateToken, removeSkill);
router.patch("/user/profile", authenticateToken, updateProfile);

// Upload a video or link
// router.post("/teach/link", authenticateToken, addTeachLink); // need to do it
// router.get("/teach/my-content", authenticateToken, getMyContent);

// ---file uploader---
const { fileUpload, linkUpload, getMyContent } = require("../Controller/teachContentManager");
router.get("/teach/my-content/:tutorId", getMyContent);
// Create a SEPARATE multer instance ONLY for Cloudinary uploads
const multerCloud = multer({ storage: multer.memoryStorage() });
// Use memoryStorage multer for Cloudinary
router.post("/teach/link", authenticateToken, multerCloud.single("data"), linkUpload);
router.post("/fileupload", authenticateToken, multerCloud.single("data"), fileUpload); //need to do

// ---------- Learning Session routes ----------
router.post("/sessions", authenticateToken, createSession);
router.get("/sessions", authenticateToken, getUserSessions);
router.patch("/sessions/:sessionId", authenticateToken, updateSessionStatus);
router.post("/sessions/:sessionId/rate", authenticateToken, rateSession);

// ---------- Learning Request routes ----------
router.post("/requests", authenticateToken, createRequest);
router.get("/requests/tutor", authenticateToken, getTutorRequests);
router.get("/requests/learner", authenticateToken, getLearnerRequests);
router.patch("/requests/:requestId/accept", authenticateToken, acceptRequest);
router.patch("/requests/:requestId/reject", authenticateToken, rejectRequest);
router.patch("/requests/:requestId/cancel", authenticateToken, cancelRequest);
router.get("/requests/skills", authenticateToken, getAllSkillsWithTutors);

// ---------- Export router ----------
module.exports = router;

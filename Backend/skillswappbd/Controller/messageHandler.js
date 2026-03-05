const Message = require("../Model/Message");
const User = require("../Model/User");

// 1. SEND MESSAGE
const sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const senderId = req.user.id; // From JWT token (authenticateToken middleware)

    // Validation
    if (!receiverId || !content) {
      return res.status(400).json({ message: "Receiver and content required" });
    }

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    console.log(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: "Receiver not found" });
    }

    // Create conversation ID (sorted so it's always the same)
    const conversationId = Message.getConversationId(senderId, receiverId);

    // Save message to database
    const message = await Message.create({
      conversationId,
      sender: senderId,
      receiver: receiverId,
      content: content.trim(),
    });

    // Return message with sender/receiver details
    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "name email")
      .populate("receiver", "name email");

    res.status(201).json({
      message: "Message sent successfully",
      data: populatedMessage,
    });
  } catch (err) {
    console.error("Error sending message:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// 2. GET CONVERSATION (all messages between you and one person)
const getConversation = async (req, res) => {
  try {
    const { userId } = req.params; // The other person's ID
    const currentUserId = req.user.id; // Your ID from token

    const conversationId = Message.getConversationId(currentUserId, userId);

    // Find all messages in this conversation
    const messages = await Message.find({ conversationId })
      .populate("sender", "name email")
      .populate("receiver", "name email")
      .sort({ createdAt: 1 }); // Oldest first

    res.status(200).json({ messages });
  } catch (err) {
    console.error("Error fetching conversation:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// 3. GET ALL CONVERSATIONS (list of all people you've chatted with)
const getAllConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find all unique conversations
    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }],
    })
      .populate("sender", "name email")
      .populate("receiver", "name email")
      .sort({ createdAt: -1 }); // Newest first

    // Group by conversation and get last message
    const conversationMap = new Map();

    messages.forEach((msg) => {
      // Skip if sender/receiver are missing (e.g., deleted user or failed populate)
      if (!msg || !msg.sender || !msg.receiver) {
        return;
      }

      const isSenderCurrentUser = String(msg.sender._id) === String(userId);
      const otherUser = isSenderCurrentUser ? msg.receiver : msg.sender;

      // If other user is missing an id, skip
      if (!otherUser || !otherUser._id) {
        return;
      }

      const otherUserId = String(otherUser._id);

      if (!conversationMap.has(otherUserId)) {
        conversationMap.set(otherUserId, {
          user: otherUser,
          lastMessage: msg.content,
          lastMessageAt: msg.createdAt,
          unreadCount: 0,
        });
      }

      // Count unread messages (ensure receiver exists and has id)
      if (msg.receiver && msg.receiver._id && String(msg.receiver._id) === String(userId) && !msg.read) {
        const entry = conversationMap.get(otherUserId);
        if (entry) entry.unreadCount++;
      }
    });

    const conversations = Array.from(conversationMap.values());

    res.status(200).json({ conversations });
  } catch (err) {
    console.error("Error fetching conversations:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// 4. MARK MESSAGES AS READ
const markAsRead = async (req, res) => {
  try {
    const { userId } = req.params; // Other user's ID
    const currentUserId = req.user.id;

    const conversationId = Message.getConversationId(currentUserId, userId);

    // Update all unread messages from this user
    await Message.updateMany(
      {
        conversationId,
        receiver: currentUserId,
        read: false,
      },
      {
        read: true,
        readAt: new Date(),
      }
    );

    res.status(200).json({ message: "Messages marked as read" });
  } catch (err) {
    console.error("Error marking messages as read:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get unread message count
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const unreadCount = await Message.countDocuments({
      receiver: userId,
      read: false,
    });

    res.status(200).json({ unreadCount });
  } catch (err) {
    console.error("Error fetching unread count:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


module.exports = {
  sendMessage,
  getConversation,
  getAllConversations,
  markAsRead,
  getUnreadCount
};

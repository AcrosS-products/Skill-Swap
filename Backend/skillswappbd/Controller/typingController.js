// Simple in-memory store for typing indicators
// In production, use Redis or similar
const typingUsers = new Map();

// Set user as typing
const setTyping = (userId, conversationId) => {
  const key = `${conversationId}_${userId}`;
  typingUsers.set(key, Date.now());

  // Auto-clear after 3 seconds
  setTimeout(() => {
    typingUsers.delete(key);
  }, 3000);
};

// Get typing users for a conversation
const getTyping = (conversationId, currentUserId) => {
  const typing = [];
  const now = Date.now();

  typingUsers.forEach((timestamp, key) => {
    const [convId, userId] = key.split("_");
    if (convId === conversationId && userId !== currentUserId && now - timestamp < 3000) {
      typing.push(userId);
    }
  });

  return typing;
};

// Clear typing indicator
const clearTyping = (userId, conversationId) => {
  const key = `${conversationId}_${userId}`;
  typingUsers.delete(key);
};

module.exports = {
  setTyping,
  getTyping,
  clearTyping,
};


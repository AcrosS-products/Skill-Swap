// src/components/ChatWindow.jsx
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import "./ChatWindow.css";

function ChatWindow({ tutorId, tutorName }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);
  const currentUserId = localStorage.getItem("userId");

  // Fetch messages when component loads
  useEffect(() => {
    if (tutorId) {
      fetchMessages();
      markMessagesAsRead();
    }
  }, [tutorId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch all messages with this tutor
  const fetchMessages = async () => {
    try {
      const res = await axios.get(
        `https://skill-swap-backend-umin.onrender.com/auth/messages/conversation/${tutorId}`,
        {
          withCredentials: true,
        }
      );
      console.log("Messages fetched:", res.data.messages);
      setMessages(res.data.messages);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching messages:", err);
      setError("Failed to load messages");
      setLoading(false);
    }
  };

  // Mark messages as read when chat opens
  const markMessagesAsRead = async () => {
    try {
      await axios.patch(
        `https://skill-swap-backend-umin.onrender.com/auth/messages/read/${tutorId}`,
        {},
        {
          withCredentials: true,
        }
      );
    } catch (err) {
      console.error("Error marking as read:", err);
    }
  };

  // Send new message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) {
      return; // Don't send empty messages
    }

    try {
      const res = await axios.post(
        "https://skill-swap-backend-umin.onrender.com/auth/messages/send",
        {
          receiverId: tutorId,
          content: newMessage,
        },
        {
          withCredentials: true,
        }
      );

      console.log("Message sent:", res.data.data);
      
      // Add new message to chat
      setMessages([...messages, res.data.data]);
      
      // Clear input box
      setNewMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
      
      // Handle token expiry
      if (err.response?.status === 403 || err.response?.status === 401) {
        alert("Session expired. Please login again.");
        window.location.href = "/";
      } else {
        alert("Failed to send message");
      }
    }
  };

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  if (loading) {
    return <div className="chat-window loading">Loading messages...</div>;
  }

  if (error) {
    return <div className="chat-window error">{error}</div>;
  }

  return (
    <div className="chat-window">
      {/* Chat Header */}
      <div className="chat-header">
        <h3>💬 Chat with {tutorName}</h3>
      </div>

      {/* Messages Container */}
      <div className="messages-container">
        {messages.length === 0 ? (
          <p className="no-messages">No messages yet. Start the conversation!</p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg._id}
              className={`message ${
                msg.sender._id === currentUserId ? "sent" : "received"
              }`}
            >
              <div className="message-content">
                <p className="message-text">{msg.content}</p>
                <span className="message-time">
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Form */}
      <form className="message-input-form" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="message-input"
        />
        <button type="submit" className="send-button">
          Send
        </button>
      </form>
    </div>
  );
}

export default ChatWindow;

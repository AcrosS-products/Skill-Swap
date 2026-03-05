import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import "./ConversationsPage.css";

const ConversationsPage = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchConversations();
    fetchUnreadCount();
    
    // Refresh every 10 seconds
    const interval = setInterval(() => {
      fetchConversations();
      fetchUnreadCount();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const fetchConversations = async () => {
    try {
      const res = await axios.get("http://localhost:4000/auth/messages/conversations", {
        withCredentials: true,
      });
      setConversations(res.data.conversations || []);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching conversations:", err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        toast.error("Session expired. Please login again.");
        navigate("/auth");
      } else {
        toast.error("Failed to load conversations");
      }
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const res = await axios.get("http://localhost:4000/auth/messages/unread-count", {
        withCredentials: true,
      });
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      console.error("Error fetching unread count:", err);
    }
  };

  const handleConversationClick = (userId) => {
    navigate(`/messages/${userId}`);
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } else if (days === 1) {
      return "Yesterday";
    } else if (days < 7) {
      return `${days} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading) {
    return (
      <div className="conversations-page">
        <div className="loading-container">Loading conversations...</div>
      </div>
    );
  }

  return (
    <div className="conversations-page">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="conversations-header">
        <h1>💬 My Conversations</h1>
        {unreadCount > 0 && (
          <div className="unread-badge-header">
            {unreadCount} unread
          </div>
        )}
      </div>

      <div className="conversations-list">
        {conversations.length === 0 ? (
          <div className="no-conversations">
            <p>No conversations yet.</p>
            <p className="no-conversations-subtitle">Start messaging tutors from the Skills page!</p>
          </div>
        ) : (
          conversations.map((conv) => (
            <div
              key={conv.user._id}
              className={`conversation-item ${conv.unreadCount > 0 ? "unread" : ""}`}
              onClick={() => handleConversationClick(conv.user._id)}
            >
              <div className="conversation-avatar">
                {conv.user.name.charAt(0).toUpperCase()}
              </div>
              <div className="conversation-content">
                <div className="conversation-header-info">
                  <h3>{conv.user.name}</h3>
                  {conv.unreadCount > 0 && (
                    <span className="unread-count-badge">{conv.unreadCount}</span>
                  )}
                </div>
                <p className="last-message">{conv.lastMessage}</p>
                <span className="last-message-time">{formatTime(conv.lastMessageAt)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ConversationsPage;


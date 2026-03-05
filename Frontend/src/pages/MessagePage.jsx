// src/pages/MessagesPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import ChatWindow from "../components/ChatWindow";
import "./MessagePage.css";

function MessagesPage() {
  const { tutorId } = useParams(); // Get tutor ID from URL
  const navigate = useNavigate();
  const [tutorName, setTutorName] = useState("Loading...");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      alert("Please login to access messages");
      navigate("/");
      return;
    }

    // Fetch tutor's name
    fetchTutorName();
  }, [tutorId]);

  const fetchTutorName = async () => {
    try {
      const res = await axios.get(
        `https://skill-swap-backend-umin.onrender.com/auth/tutorname/${tutorId}`,
        {
          withCredentials: true,
        }
      );
      setTutorName(res.data.name);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching tutor name:", err);
      if (err.response?.status === 403 || err.response?.status === 401) {
        alert("Session expired. Please login again.");
        navigate("/");
      }
      setTutorName("Unknown User");
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/dashboard"); // Or wherever your skills page is
  };

  if (loading) {
    return (
      <div className="messages-page">
        <div className="loading-container">Loading...</div>
      </div>
    );
  }

  return (
    <div className="messages-page">
      <button className="back-button" onClick={handleBack}>
        ← Back to Dashboard
      </button>
      <ChatWindow tutorId={tutorId} tutorName={tutorName} />
    </div>
  );
}

export default MessagesPage;

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./LearningSessionsPage.css";

const LearningSessionsPage = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, pending, active, completed
  const navigate = useNavigate();

  useEffect(() => {
    fetchSessions();
  }, [filter]);

  const fetchSessions = async () => {
    try {
      const params = filter !== "all" ? { status: filter } : {};
      const res = await axios.get("https://skill-swap-backend-umin.onrender.com/auth/sessions", {
        withCredentials: true,
        params,
      });
      setSessions(res.data.sessions || []);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching sessions:", err);
      toast.error("Failed to load sessions");
      setLoading(false);
    }
  };

  const handleStartSession = async (sessionId) => {
    try {
      await axios.patch(
        `https://skill-swap-backend-umin.onrender.com/auth/sessions/${sessionId}`,
        { status: "active" },
        {
          withCredentials: true,
        }
      );
      toast.success("Session started!");
      fetchSessions();
    } catch (err) {
      toast.error("Failed to start session");
    }
  };

  const handleCompleteSession = async (sessionId) => {
    try {
      await axios.patch(
        `https://skill-swap-backend-umin.onrender.com/auth/sessions/${sessionId}`,
        { status: "completed" },
        {
          withCredentials: true,
        }
      );
      toast.success("Session completed!");
      fetchSessions();
    } catch (err) {
      toast.error("Failed to complete session");
    }
  };

  const handleMessageTutor = (tutorId) => {
    navigate(`/messages/${tutorId}`);
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: "⏳ Pending",
      active: "🟢 Active",
      completed: "✅ Completed",
      cancelled: "❌ Cancelled",
    };
    return badges[status] || status;
  };

  if (loading) {
    return (
      <div className="sessions-page">
        <div className="loading-container">Loading sessions...</div>
      </div>
    );
  }

  return (
    <div className="sessions-page">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="sessions-header">
        <h1>📚 Learning Sessions</h1>
        <div className="filter-buttons">
          <button
            className={filter === "all" ? "active" : ""}
            onClick={() => setFilter("all")}
          >
            All
          </button>
          <button
            className={filter === "pending" ? "active" : ""}
            onClick={() => setFilter("pending")}
          >
            Pending
          </button>
          <button
            className={filter === "active" ? "active" : ""}
            onClick={() => setFilter("active")}
          >
            Active
          </button>
          <button
            className={filter === "completed" ? "active" : ""}
            onClick={() => setFilter("completed")}
          >
            Completed
          </button>
        </div>
      </div>

      <div className="sessions-list">
        {sessions.length === 0 ? (
          <div className="no-sessions">
            <p>No learning sessions found.</p>
            <p className="no-sessions-subtitle">
              Start learning by messaging tutors from the Skills page!
            </p>
          </div>
        ) : (
          sessions.map((session) => (
            <div key={session._id} className="session-card">
              <div className="session-header-info">
                <div>
                  <h3>{session.skill}</h3>
                  <span className="status-badge">{getStatusBadge(session.status)}</span>
                </div>
                <p className="session-partner">
                  {session.learner._id === localStorage.getItem("userId")
                    ? `👨‍🏫 Tutor: ${session.tutor.name}`
                    : `👨‍🎓 Learner: ${session.learner.name}`}
                </p>
              </div>

              <div className="session-actions">
                {session.status === "pending" && (
                  <button
                    className="btn-start"
                    onClick={() => handleStartSession(session._id)}
                  >
                    ▶️ Start Session
                  </button>
                )}
                {session.status === "active" && (
                  <button
                    className="btn-complete"
                    onClick={() => handleCompleteSession(session._id)}
                  >
                    ✅ Complete Session
                  </button>
                )}
                <button
                  className="btn-message"
                  onClick={() =>
                    handleMessageTutor(
                      session.learner._id === localStorage.getItem("userId")
                        ? session.tutor._id
                        : session.learner._id
                    )
                  }
                >
                  💬 Message
                </button>
              </div>

              {session.notes && (
                <div className="session-notes">
                  <p><strong>Notes:</strong> {session.notes}</p>
                </div>
              )}

              {session.rating && (
                <div className="session-rating">
                  <p>
                    <strong>Rating:</strong> {"⭐".repeat(session.rating)}
                  </p>
                  {session.review && <p>{session.review}</p>}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LearningSessionsPage;


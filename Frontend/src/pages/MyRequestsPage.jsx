import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./MyRequestsPage.css";

const MyRequestsPage = () => {
  const [raisedRequests, setRaisedRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("raised"); // "raised" or "received"
  const [filter, setFilter] = useState("all"); // all, pending, accepted, rejected
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllRequests();
  }, [filter]);

  const fetchAllRequests = async () => {
    setLoading(true);
    try {
      const [raisedRes, receivedRes] = await Promise.all([
        axios.get("https://skill-swap-backend-umin.onrender.com/auth/requests/learner", {
          withCredentials: true,
          params: { status: filter === "all" ? undefined : filter },
        }),
        axios.get("https://skill-swap-backend-umin.onrender.com/auth/requests/tutor", {
          withCredentials: true,
          params: { status: filter === "all" ? undefined : filter },
        }),
      ]);
      setRaisedRequests(raisedRes.data.requests || []);
      setReceivedRequests(receivedRes.data.requests || []);
      setLoading(false);
    } catch (err) {
      toast.error("Failed to load requests");
      setLoading(false);
    }
  };

  const handleCancel = async (requestId) => {
    if (!window.confirm("Are you sure you want to cancel this request?")) {
      return;
    }

    try {
      await axios.patch(
        `https://skill-swap-backend-umin.onrender.com/auth/requests/${requestId}/cancel`,
        {},
        {
          withCredentials: true,
        }
      );
      toast.success("Request cancelled");
      fetchAllRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to cancel request");
    }
  };

  const handleAccept = async (requestId) => {
    try {
      await axios.patch(
        `https://skill-swap-backend-umin.onrender.com/auth/requests/${requestId}/accept`,
        {},
        {
          withCredentials: true,
        }
      );
      toast.success("Request accepted successfully");
      fetchAllRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to accept request");
    }
  };

  const handleReject = async (requestId) => {
    if (!window.confirm("Are you sure you want to reject this request?")) {
      return;
    }

    try {
      await axios.patch(
        `https://skill-swap-backend-umin.onrender.com/auth/requests/${requestId}/reject`,
        {},
        {
          withCredentials: true,
        }
      );
      toast.success("Request rejected");
      fetchAllRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reject request");
    }
  };

  const handleViewProfile = (userId) => {
    navigate(`/profile/${userId}`);
  };

  const handleMessage = (userId) => {
    navigate(`/messages/${userId}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not scheduled";
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const currentRequests = activeSection === "raised" ? raisedRequests : receivedRequests;

  if (loading) {
    return (
      <div className="my-requests-page">
        <div className="loading-container">Loading your requests...</div>
      </div>
    );
  }

  const renderRequestCard = (request, isRaised) => {
    const userInfo = isRaised ? request.tutor : request.learner;

    // Handle null userInfo (user might be deleted or not populated)
    if (!userInfo) {
      return (
        <div key={request._id} className={`request-card ${request.status}`}>
          <div className="request-details">
            <div className="request-skill">
              <strong>Skill:</strong> {request.skill}
            </div>
            <div className="request-message" style={{ color: '#ef4444' }}>
              <strong>⚠️ User Information Not Available</strong>
            </div>
            <div className="request-time">
              <strong>Requested:</strong> {new Date(request.createdAt).toLocaleString()}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div key={request._id} className={`request-card ${request.status}`}>
        <div className="request-header">
          <div className="tutor-info">
            <div className="tutor-avatar">
              {userInfo.name ? userInfo.name.charAt(0).toUpperCase() : '?'}
            </div>
            <div>
              <h3
                onClick={() => userInfo._id && handleViewProfile(userInfo._id)}
                className="tutor-name"
                style={{ cursor: userInfo._id ? 'pointer' : 'default' }}
              >
                {userInfo.name || 'Unknown User'}
              </h3>
              <p className="tutor-email">{userInfo.email || 'Email not available'}</p>
            </div>
          </div>
          <span className={`status-badge ${request.status}`}>
            {request.status === "pending" && "⏳ Pending"}
            {request.status === "accepted" && "✅ Accepted"}
            {request.status === "rejected" && "❌ Rejected"}
            {request.status === "cancelled" && "🚫 Cancelled"}
          </span>
        </div>

        <div className="request-details">
          <div className="request-skill">
            <strong>Skill:</strong> {request.skill}
          </div>
          {request.message && (
            <div className="request-message">
              <strong>{isRaised ? "Your Message:" : "Learner's Message:"}</strong> {request.message}
            </div>
          )}
          {request.scheduledDate && (
            <div className="request-date">
              <strong>Scheduled:</strong> {formatDate(request.scheduledDate)}
            </div>
          )}
          {request.duration && (
            <div className="request-duration">
              <strong>Duration:</strong> {request.duration} minutes
            </div>
          )}
          <div className="request-time">
            <strong>Requested:</strong> {new Date(request.createdAt).toLocaleString()}
          </div>
        </div>

        {/* Actions for Raised Requests */}
        {isRaised && request.status === "pending" && (
          <div className="request-actions">
            <button
              className="btn-cancel"
              onClick={() => handleCancel(request._id)}
            >
              🚫 Cancel Request
            </button>
            <button
              className="btn-message"
              onClick={() => request.tutor && handleMessage(request.tutor._id)}
              disabled={!request.tutor}
            >
              💬 Message Tutor
            </button>
          </div>
        )}

        {isRaised && request.status === "accepted" && (
          <div className="request-actions">
            <button
              className="btn-view-session"
              onClick={() => navigate("/sessions")}
            >
              📚 View Learning Session
            </button>
            <button
              className="btn-message"
              onClick={() => request.tutor && handleMessage(request.tutor._id)}
              disabled={!request.tutor}
            >
              💬 Message Tutor
            </button>
          </div>
        )}

        {isRaised && request.status === "rejected" && (
          <div className="request-actions">
            <button
              className="btn-message"
              onClick={() => request.tutor && handleMessage(request.tutor._id)}
              disabled={!request.tutor}
            >
              💬 Message Tutor
            </button>
            <button
              className="btn-new-request"
              onClick={() => navigate("/skills")}
            >
              🔍 Find Another Tutor
            </button>
          </div>
        )}

        {/* Actions for Received Requests */}
        {!isRaised && request.status === "pending" && (
          <div className="request-actions">
            <button
              className="btn-accept"
              onClick={() => handleAccept(request._id)}
            >
              ✅ Accept Request
            </button>
            <button
              className="btn-reject"
              onClick={() => handleReject(request._id)}
            >
              ❌ Reject Request
            </button>
            <button
              className="btn-message"
              onClick={() => request.learner && handleMessage(request.learner._id)}
              disabled={!request.learner}
            >
              💬 Message Learner
            </button>
          </div>
        )}

        {!isRaised && request.status === "accepted" && (
          <div className="request-actions">
            <button
              className="btn-view-session"
              onClick={() => navigate("/sessions")}
            >
              📚 View Learning Session
            </button>
            <button
              className="btn-message"
              onClick={() => request.learner && handleMessage(request.learner._id)}
              disabled={!request.learner}
            >
              💬 Message Learner
            </button>
          </div>
        )}

        {!isRaised && request.status === "rejected" && (
          <div className="request-actions">
            <button
              className="btn-message"
              onClick={() => request.learner && handleMessage(request.learner._id)}
              disabled={!request.learner}
            >
              💬 Message Learner
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="my-requests-page">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="requests-header">
        <h1>📖 My Requests</h1>
        <p className="requests-subtitle">Manage your raised and received learning requests</p>
      </div>

      {/* Section Tabs */}
      <div className="section-tabs">
        <button
          className={`section-tab ${activeSection === "raised" ? "active" : ""}`}
          onClick={() => setActiveSection("raised")}
        >
          📤 Raised Requests ({raisedRequests.length})
        </button>
        <button
          className={`section-tab ${activeSection === "received" ? "active" : ""}`}
          onClick={() => setActiveSection("received")}
        >
          📥 Received Requests ({receivedRequests.length})
        </button>
      </div>

      <div className="request-filters">
        <button
          className={`filter-btn ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          📋 All
        </button>
        <button
          className={`filter-btn ${filter === "pending" ? "active" : ""}`}
          onClick={() => setFilter("pending")}
        >
          ⏳ Pending ({currentRequests.filter(r => r.status === "pending").length})
        </button>
        <button
          className={`filter-btn ${filter === "accepted" ? "active" : ""}`}
          onClick={() => setFilter("accepted")}
        >
          ✅ Accepted ({currentRequests.filter(r => r.status === "accepted").length})
        </button>
        <button
          className={`filter-btn ${filter === "rejected" ? "active" : ""}`}
          onClick={() => setFilter("rejected")}
        >
          ❌ Rejected ({currentRequests.filter(r => r.status === "rejected").length})
        </button>
      </div>

      <div className="requests-list">
        {currentRequests.length === 0 ? (
          <div className="no-requests">
            <p>No {filter === "all" ? "" : filter} {activeSection === "raised" ? "raised" : "received"} requests found.</p>
            <p className="no-requests-subtitle">
              {activeSection === "raised"
                ? filter === "pending"
                  ? "Start learning by requesting to learn from tutors!"
                  : "Browse skills and request to learn from tutors to get started."
                : filter === "pending"
                ? "You haven't received any requests yet."
                : "You haven't received any requests yet."}
            </p>
          </div>
        ) : (
          currentRequests.map((request) => renderRequestCard(request, activeSection === "raised"))
        )}
      </div>
    </div>
  );
};

export default MyRequestsPage;


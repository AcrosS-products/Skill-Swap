import React, { useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import "./RequestModal.css";

const RequestModal = ({ tutorId, tutorName, skillName, onClose, onSuccess }) => {
  const [message, setMessage] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [duration, setDuration] = useState(60);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(
        "https://skill-swap-backend-umin.onrender.com/auth/requests",
        {
          tutorId,
          skill: skillName,
          message: message.trim(),
          scheduledDate: scheduledDate || undefined,
          duration: parseInt(duration),
        },
        {
          withCredentials: true,
        }
      );

      toast.success("Learning request sent successfully!");
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send request");
    } finally {
      setLoading(false);
    }
  };

  // Set minimum date to today
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="request-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📝 Request to Learn from {tutorName}</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="request-form">
          <div className="form-group">
            <label>Skill</label>
            <input type="text" value={skillName} disabled className="form-input" />
          </div>

          <div className="form-group">
            <label>Message to Tutor (Optional)</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Hi! I'd like to learn from you..."
              className="form-textarea"
              rows="4"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Preferred Date & Time (Optional)</label>
              <input
                type="datetime-local"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                min={today}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Duration (minutes)</label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                min="15"
                max="300"
                step="15"
                className="form-input"
              />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-cancel">
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? "Sending..." : "📤 Send Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestModal;


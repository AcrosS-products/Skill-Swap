import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./UserProfile.css";

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const currentUserId = localStorage.getItem("userId");

  useEffect(() => {
    fetchUserProfile();
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      const res = await axios.get(`http://localhost:4000/auth/user/${userId}`, {
        withCredentials: true,
      });
      setUser(res.data.user);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching profile:", err);
      toast.error("Failed to load profile");
      setLoading(false);
    }
  };

  const handleMessage = () => {
    navigate(`/messages/${userId}`);
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="loading-container">Loading profile...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-page">
        <div className="error-container">User not found</div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <button className="back-button" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar-large">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="profile-info">
            <h1>{user.name}</h1>
            <p className="profile-email">📧 {user.email}</p>
            {user.bio && <p className="profile-bio">{user.bio}</p>}
          </div>
        </div>

        {user.skills && user.skills.length > 0 && (
          <div className="profile-skills">
            <h2>🎓 Skills I Teach</h2>
            <div className="skills-grid">
              {user.skills.map((skill, index) => (
                <div key={index} className="skill-badge">
                  {skill}
                </div>
              ))}
            </div>
          </div>
        )}

        {userId !== currentUserId && (
          <div className="profile-actions">
            <button className="btn-message" onClick={handleMessage}>
              💬 Send Message
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;


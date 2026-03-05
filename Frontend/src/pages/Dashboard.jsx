import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const Dashboard = ({ user, setUser }) => {
  const [newSkill, setNewSkill] = useState("");
  const [teachingSkills, setTeachingSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [skillMode, setSkillMode] = useState("teach"); // "teach" or "learn"
  const navigate = useNavigate();

  // Get user info from localStorage if user prop is not available
  const userId = localStorage.getItem("userId");
  const userName = localStorage.getItem("userName") || "User";
  const userEmail = localStorage.getItem("userEmail") || "";

  // Fetch user skills on component mount
  useEffect(() => {
    if (userId) {
      fetchUserSkills();
    }
  }, [userId]);

  const fetchUserSkills = async () => {
    try {
      const res = await axios.get("http://localhost:4000/auth/user/skills", {
        withCredentials: true,
      });
      setTeachingSkills(res.data.skills || []);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching skills:", err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        toast.error("Session expired. Please login again.");
        navigate("/auth");
      }
      setTeachingSkills([]);
      setLoading(false);
    }
  };

  const handleAddSkill = async () => {
    if (newSkill.trim() === "") {
      toast.warning("Please enter a skill name");
      return;
    }

    if (!userId) {
      toast.error("User ID not found. Please login again.");
      navigate("/auth");
      return;
    }

    try {
      const res = await fetch(`http://localhost:4000/auth/add-skill/${userId}`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ skill: newSkill.trim() }),
      });

      const result = await res.json();
      if (res.ok) {
        // Refresh skills list
        await fetchUserSkills();
        toast.success("Skill added successfully!");
        setNewSkill("");
      } else {
        toast.error(result.message || "Failed to add skill");
      }
    } catch (err) {
      console.error("Error adding skill:", err);
      toast.error("Failed to add skill. Please try again.");
    }
  };

  const handleRemoveSkill = async (skill) => {
    try {
      const res = await axios.delete("http://localhost:4000/auth/user/skill", {
        withCredentials: true,
        data: { skill },
      });

      if (res.status === 200) {
        toast.success("Skill removed successfully!");
        await fetchUserSkills();
      }
    } catch (err) {
      console.error("Error removing skill:", err);
      toast.error(err.response?.data?.message || "Failed to remove skill");
    }
  };

  const handleLogout = () => {
    // Clear all stored data
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    
    if (setUser) {
      setUser(null);
    }
    
    toast.success("Logged out successfully!");
    
    // Redirect to home page
    navigate("/");
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome back, {userName}!</h1>
        <button 
          onClick={handleLogout} 
          className="btn btn--secondary"
        >
          Logout
        </button>
      </div>

      <div className="dashboard-welcome-card">
        <div className="avatar-container">
          <div className="welcome-avatar">
            {userName.charAt(0).toUpperCase()}
          </div>
        </div>
        <h1>Welcome, {userName}!</h1>
        <p>You are successfully logged in to Skill Swap.</p>
        {userEmail && (
          <p className="welcome-email">📧 {userEmail}</p>
        )}
      </div>

      <div className="add-skill-section">
        <div className="skill-mode-toggle">
          <button
            className={`mode-btn ${skillMode === "teach" ? "active" : ""}`}
            onClick={() => setSkillMode("teach")}
          >
            🎓 Skills I Teach
          </button>
          <button
            className={`mode-btn ${skillMode === "learn" ? "active" : ""}`}
            onClick={() => setSkillMode("learn")}
          >
            🎯 Skills I Want to Learn
          </button>
        </div>

        {skillMode === "teach" ? (
          <>
            <h2>✨ Add Skills You Can Teach</h2>
            <p className="skill-section-description">
              Add skills you're an expert in so others can learn from you!
            </p>
            <div className="add-skill-form">
              <input
                type="text"
                value={newSkill}
                placeholder="e.g., JavaScript, Photography, Spanish..."
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleAddSkill();
                  }
                }}
              />
              <button onClick={handleAddSkill} className="add-skill-btn">
                ➕ Add Skill
              </button>
            </div>

            {teachingSkills.length > 0 ? (
              <>
                <h3 className="skills-list-title">Skills You Teach:</h3>
                <ul className="teaching-skill-list">
                  {teachingSkills.map((skill, index) => (
                    <li key={index}>
                      <span className="skill-icon">🎓</span>
                      <span className="skill-name">{skill}</span>
                      <button
                        className="remove-skill-btn"
                        onClick={() => handleRemoveSkill(skill)}
                        title="Remove skill"
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <div className="no-skills-message">
                <p>No skills added yet. Add skills you can teach above!</p>
              </div>
            )}
          </>
        ) : (
          <>
            <h2>🎯 Skills You Want to Learn</h2>
            <p className="skill-section-description">
              Add skills you'd like to learn and find tutors who can teach you!
            </p>
            <div className="info-box">
              <p>💡 <strong>Tip:</strong> Switch to "Skills I Teach" to offer your expertise!</p>
              <p>Browse available tutors on the <Link to="/skills" className="link-to-skills">Skills page</Link>.</p>
            </div>
          </>
        )}
      </div>

      {/* Activity Feed */}
      <div className="activity-feed-section">
        <h2>📊 Recent Activity</h2>
        <div className="activity-items">
          <div className="activity-item">
            <span className="activity-icon">💬</span>
            <div className="activity-content">
              <p>Your conversations are synced in real-time</p>
              <Link to="/conversations" className="activity-link">
                View Messages →
              </Link>
            </div>
          </div>
          <div className="activity-item">
            <span className="activity-icon">📖</span>
            <div className="activity-content">
              <p>Track your learning requests</p>
              <Link to="/my-requests" className="activity-link">
                View Requests →
              </Link>
            </div>
          </div>
          <div className="activity-item">
            <span className="activity-icon">📚</span>
            <div className="activity-content">
              <p>Manage your learning sessions</p>
              <Link to="/sessions" className="activity-link">
                View Sessions →
              </Link>
            </div>
          </div>
          <div className="activity-item">
            <span className="activity-icon">🎓</span>
            <div className="activity-content">
              <p>Share your expertise and help others learn</p>
              <span className="activity-hint">
                Add skills you can teach above!
              </span>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer 
        position="top-right" 
        autoClose={3000} 
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default Dashboard;

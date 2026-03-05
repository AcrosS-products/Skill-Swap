import React, { useState } from "react";
import TutorInfo from "./TutorInfo"; // replaces TutorName
import RequestModal from "./RequestModal";
import "./Skills.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Skills({ skill }) {
  // All hooks must be called before any conditional returns
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [tutorNames, setTutorNames] = useState({});
  const navigate = useNavigate();

  // Early return after hooks
  if (!skill) return <p>Skill data not available.</p>;

  const { id, name, tutors } = skill;

  console.log(tutors);

  //  Chat Button
  const handleMessageClick = (tutorId) => {
    navigate(`/messages/${tutorId}`);
  };

  //  View Content Button
  const handleViewContentClick = (tutorId) => {
    navigate(`/tutor/${tutorId}/content`);
  };

  //  Fetch tutor name from backend
  const fetchTutorName = async (tutorId) => {
    try {
      const res = await axios.get(
        `https://skill-swap-backend-umin.onrender.com/auth/tutorname/${tutorId}`,
        {
          withCredentials: true,
        }
      );
      return res.data.name;
    } catch (err) {
      console.error("Error fetching tutor name:", err);
      return "Tutor";
    }
  };

  //  Handle Learn Request
  const handleRequestLearn = async (tutorId) => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      alert("Please login to request learning sessions");
      navigate("/auth");
      return;
    }

    // Fetch tutor name
    const tutorName = await fetchTutorName(tutorId);
    console.log(tutorName);
    setSelectedTutor({ id: tutorId, name: tutorName });
    setShowRequestModal(true);
  };

  const handleRequestSuccess = () => {
    // You could show a success toast or reload something
  };

  const handleNameReady = (tutorId, name) => {
    setTutorNames((prev) => ({ ...prev, [tutorId]: name }));
  };

  return (
    <div className="skill-section" key={id}>
      <h2 className="skill-title">{name}</h2>

      <div className="tutor-grid">
        {tutors && tutors.length > 0 ? (
          tutors.map((tutorId ) => (
            <div className="tutor-card" key={tutorId}>
              <div className="tutor-info">
                {/* Shows tutor details */}
                <TutorInfo tutorId={tutorId} />

                <div className="tutor-actions">
                  <button
                    className="request-btn"
                    onClick={() => handleRequestLearn(tutorId)}
                  >
                    📖 Request to Learn
                  </button>

                  <button
                    className="message-btn"
                    onClick={() => handleMessageClick(tutorId)}
                  >
                    💬 Chat
                  </button>

                  <button
                    className="content-btn"
                    onClick={() => handleViewContentClick(tutorId)}
                  >
                    📚 View Content
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="no-tutors">No tutors available for this skill.</p>
        )}
      </div>

      {showRequestModal && selectedTutor && (
        <RequestModal
          tutorId={selectedTutor.id}
          tutorName={selectedTutor.name}
          skillName={name}
          onClose={() => {
            setShowRequestModal(false);
            setSelectedTutor(null);
          }}
          onSuccess={handleRequestSuccess}
        />
      )}
    </div>
  );
}

export default Skills;

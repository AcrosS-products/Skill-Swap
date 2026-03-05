import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

function TutorInfo({ tutorId }) {
  const [name, setName] = useState("Loading...");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!tutorId) return;
    const fetchTutor = async () => {
      try {
        const res = await axios.get(
          `http://localhost:4000/auth/tutorname/${tutorId}`,
          {
            withCredentials: true,
          }
        );

        setName(res.data.name);
      } catch (err) {
        console.error("Error fetching tutor name:", err);
        if (err.response?.status === 403 || err.response?.status === 401) {
          setError("Session expired");
        } else {
          setError("Unknown Tutor");
        }
      }
    };

    fetchTutor();
  }, [tutorId]);

  return (
    <Link
      to={`/profile/${tutorId}`}
      style={{
        textDecoration: "none",
        color: "inherit",
        display: "block",
        transition: "color 0.2s",
      }}
      onMouseEnter={(e) => (e.target.style.color = "var(--primary-light)")}
      onMouseLeave={(e) => (e.target.style.color = "")}
    >
      <h4 style={{ margin: 0, cursor: "pointer" }}>{error || name}</h4>
    </Link>
  );
}

export default TutorInfo;

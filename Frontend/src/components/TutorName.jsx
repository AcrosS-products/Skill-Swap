// TutorName.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

function TutorName({ tutorId }) {
  const [name, setName] = useState("Loading...");
  const [error, setError] = useState("");

  useEffect(() => {
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
        setError("Unknown Tutor");
      }
    };

    if (tutorId) fetchTutor();
  }, [tutorId]);

  return <h4>{error || name}</h4>;
}

export default TutorName;

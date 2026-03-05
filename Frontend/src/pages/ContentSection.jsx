// src/components/ContentSection.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import TutorName from "../components/TutorName";
import "./ContentSection.css";

const ContentSection = () => {
  const { tutorId } = useParams();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!tutorId) return;

    const fetchContent = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `https://skill-swap-backend-umin.onrender.com/auth/teach/my-content/${tutorId}`,
          {
            withCredentials: true,
          }
        );
        setItems(res.data.items.content || []);
      } catch (err) {
        setError("Failed to load tutor content");
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [tutorId]);

  if (loading) return <p>Loading content...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  function MediaRenderer({ item }) {
    if (item.type === "link") {
      return (
        <a href={item.url} target="_blank" rel="noopener noreferrer" className='link-container'>
          {item.url}
        </a>
      );
    }

    return (
      <video width="640" controls>
        <source src={item.url} />
      </video>
    );
  }

  return (
    <div className="content-page">
      <h1 className="content-title">Tutor's Uploaded Content</h1>
      <div className="content-tutor">
        <TutorName tutorId={tutorId} />
      </div>

      {items.length === 0 ? (
        <p className="no-content">No data uploaded yet.</p>
      ) : (
        <div className="content-list">
          {items.map((item) => (
            <div className="content-item" key={item._id}>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <MediaRenderer item={item}/>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContentSection;

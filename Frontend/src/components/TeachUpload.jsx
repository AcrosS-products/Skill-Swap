// src/components/TeachUpload.jsx
import React, { useState } from "react";
import "./TeachUpload.css";

export default function TeachUpload({ onUploaded }) {
  const [mode, setMode] = useState("video"); // 'video' | 'link'
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [linkUrl, setLinkUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setVideoFile(null);
    setLinkUrl("");
  };

  const submitVideo = async () => {
    if (!videoFile) {
      setError("Please choose a video file.");
      return;
    }
    const fd = new FormData();
    fd.append("title", title);
    fd.append("description", description);
    fd.append("data", videoFile);
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("http://localhost:4000/auth/fileUpload", {
        method: "POST",
        credentials: "include",
        body: fd,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Upload failed");
      resetForm();
      onUploaded?.();
    } catch (e) {
      setError(e.message || "Upload failed");
    } finally {
      setSubmitting(false);
    }
  };

  const submitLink = async () => {
    if (!linkUrl.trim()) {
      setError("Please enter a valid URL.");
      return;
    }
    const fd = new FormData();
    fd.append("title", title);
    fd.append("description", description);
    fd.append("data", linkUrl);
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("http://localhost:4000/auth/teach/link", {
        method: "POST",
        credentials: "include",
        body: fd,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Save failed");
      resetForm();
      onUploaded?.();
    } catch (e) {
      setError(e.message || "Save failed");
    } finally {
      setSubmitting(false);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (mode === "video") submitVideo();
    else submitLink();
  };

  return (
    <section className="teach-upload">
      <div className="teach-tabs" role="tablist" aria-label="Upload type">
        <button
          role="tab"
          aria-selected={mode === "video"}
          className={`teach-tab ${mode === "video" ? "active" : ""}`}
          onClick={() => setMode("video")}
        >
          Upload video
        </button>
        <button
          role="tab"
          aria-selected={mode === "link"}
          className={`teach-tab ${mode === "link" ? "active" : ""}`}
          onClick={() => setMode("link")}
        >
          Add resource link
        </button>
      </div>

      <form className="teach-form" onSubmit={onSubmit}>
        <div className="field">
          <label>Title</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Intro to React Hooks"
          />
        </div>

        <div className="field">
          <label>Description</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What will learners get from this?"
          />
        </div>

        {mode === "video" ? (
          <div className="field">
            <label>Video file</label>
            <input
              type="file"
              accept="video/*"
              onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
            />
            <small>Accepted: video/*</small>
          </div>
        ) : (
          <div className="field">
            <label>Resource URL</label>
            <input
              type="url"
              required
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com/course"
            />
          </div>
        )}

        {error && <div className="error">{error}</div>}

        <div className="actions">
          <button type="submit" disabled={submitting}>
            {submitting ? "Saving..." : mode === "video" ? "Upload video" : "Add link"}
          </button>
        </div>
      </form>
    </section>
  );
}

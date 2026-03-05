import React, { useState, useEffect, useMemo } from "react";
import Skills from "../components/Skills";
import TeachUpload from "../components/TeachUpload";

async function fetchJSON(url, options = {}) {
  const res = await fetch(url, options);
  const ct = res.headers.get("content-type") || "";
  const text = await res.text();

  if (!res.ok) {
    let msg = text;
    if (ct.includes("application/json")) {
      try {
        const parsed = JSON.parse(text);
        msg = parsed.message || msg;
      } catch {}
    }
    throw new Error(msg || `HTTP ${res.status}`);
  }

  if (!ct.includes("application/json")) {
    throw new TypeError(`Expected JSON, got ${ct || "unknown"}`);
  }

  return JSON.parse(text);
}

const SkillSet = () => {

  const [learnSkill, setLearnSkill] = useState(-1);

  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const [teachItems, setTeachItems] = useState([]);
  const [teachLoading, setTeachLoading] = useState(false);
  const [teachError, setTeachError] = useState(null);

  const isLoggedIn =
    typeof window !== "undefined"
      ? !!localStorage.getItem("userId")
      : false;

  const [query, setQuery] = useState("");

  // ---------------- LEARN FETCH ----------------
  useEffect(() => {

    if (learnSkill !== 0) return;
    if (data.length > 0) return;

    const controller = new AbortController();
    const { signal } = controller;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await fetchJSON(
          "https://skill-swap-backend-umin.onrender.com/auth/learn",
          {
            method: "GET",
            headers: { Accept: "application/json" },
            signal,
          }
        );

        setData(Array.isArray(result.output) ? result.output : []);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Failed to load skills.");
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();

  }, [learnSkill, data.length]);

  // ---------------- TEACH FETCH ----------------
  useEffect(() => {

    if (learnSkill !== 1) return;
    if (!isLoggedIn) return;

    const controller = new AbortController();
    const { signal } = controller;

    (async () => {
      try {

        setTeachLoading(true);
        setTeachError(null);

        const json = await fetchJSON(
          `https://skill-swap-backend-umin.onrender.com/auth/teach/my-content/${localStorage.getItem("userId")}`,
          {
            method: "GET",
            credentials: "include",
            headers: { Accept: "application/json" },
            signal,
          }
        );

        setTeachItems(
          Array.isArray(json.items?.content)
            ? json.items.content
            : []
        );

      } catch (err) {
        if (err.name !== "AbortError") {
          setTeachError(err.message || "Failed to load uploads");
        }
      } finally {
        setTeachLoading(false);
      }
    })();

    return () => controller.abort();

  }, [learnSkill, isLoggedIn]);

  // ---------------- REFRESH TEACH ----------------
  const refreshTeach = async () => {

    if (learnSkill !== 1 || !isLoggedIn) return;

    try {

      setTeachLoading(true);
      setTeachError(null);

      const json = await fetchJSON(
        "https://skill-swap-backend-umin.onrender.com/auth/teach/my-content/:", // /teach/my-content/:tutorId
        {
          method: "GET",
          credentials: "include",
          headers: { Accept: "application/json" },
        }
      );

      setTeachItems(
        Array.isArray(json.items?.content)
          ? json.items.content
          : []
      );

    } catch (err) {
      
      setTeachError(err.message || "Failed to load uploads");

    } finally {

      setTeachLoading(false);

    }
  };

  // ---------------- SEARCH FILTER ----------------
  const normalizedQuery = query.trim().toLowerCase();

  const filteredSkills = useMemo(() => {

    if (!normalizedQuery) return data;

    return data.filter((s) =>
      s?.name?.toLowerCase().includes(normalizedQuery)
    );

  }, [data, normalizedQuery]);

  const total = data.length;
  const shown = filteredSkills.length;

  const onSearchChange = (e) => {
    const next = e.target.value;
    setQuery(next);
    if (next && learnSkill !== 0) setLearnSkill(0);
  };

  const clearSearch = () => setQuery("");

  return (
    <div className="skill-container">

      {/* SEARCH */}
      <form
        role="search"
        className="skill-search"
        onSubmit={(e) => e.preventDefault()}
      >
        <input
          type="search"
          className="search-input"
          placeholder="Search skills"
          value={query}
          onChange={onSearchChange}
        />

        {query && (
          <button
            type="button"
            className="clear-btn"
            onClick={clearSearch}
          >
            ✕
          </button>
        )}
      </form>

      {/* TOGGLE */}
      <div className="skill-toggle">

        <button
          className={`btn btn-learn ${
            learnSkill === 0 ? "active" : ""
          }`}
          onClick={() => setLearnSkill(0)}
        >
          Want to learn a skill
        </button>

        <button
          className={`btn btn-teach ${
            learnSkill === 1 ? "active" : ""
          }`}
          onClick={() => setLearnSkill(1)}
        >
          Teach a skill
        </button>

      </div>

      {/* STATUS */}
      <div className="result-summary">

        {learnSkill === 0 && (
          loading
            ? "Loading skills..."
            : error
            ? `Error: ${error}`
            : normalizedQuery
            ? `Showing ${shown} of ${total} skills`
            : `Showing all ${total} skills`
        )}

        {learnSkill === 1 && (
          teachLoading
            ? "Loading your uploads..."
            : (teachError)
            ? `Error: ${teachError}`
            : `You have ${(teachItems || []).length} uploads`
        )}

{learnSkill === -1 && "Choose Learn or start typing to search"}

      </div>

      {/* CONTENT */}
      <div className="skill-content">

        {learnSkill === -1 ? (

          <>
            <div className="showskill skill-placeholder">
              Learn the Skill
            </div>

            <div className="showskill skill-placeholder">
              Teach the Skill
            </div>
          </>

        ) : learnSkill === 0 ? (

          <div className="showskill learn-content">

            {loading ? (
              <p>Loading...</p>
            ) : error ? (
              <p style={{ color: "red" }}>{error}</p>
            ) : filteredSkills.length > 0 ? (
              filteredSkills.map((skill) => (
                <div key={skill.id || skill._id}>
                  <Skills skill={skill} />
                </div>
              ))
            ) : (
              <p>No matching skills found.</p>
            )}

          </div>

        ) : (

          <div className="showskill teach-content">

            {!isLoggedIn ? (

              <p>Please log in to upload content.</p>

            ) : (

              <>
                <TeachUpload onUploaded={refreshTeach} />

                <div className="teach-list">

                  {teachLoading ? (
                    <p>Loading uploads...</p>
                  ) : teachError ? (
                    <p style={{ color: "red" }}>
                      {teachError}
                    </p>
                  ) : teachItems.length === 0 ? (
                    <p>No uploads yet.</p>
                  ) : (
                    teachItems.map((item) => (
                      <div
                        className="teach-item"
                        key={item.id || item._id}
                      >

                        <div className="teach-item-meta">

                          <div className="teach-item-title">
                            {item.title || "Untitled"}
                          </div>

                          <div className="teach-item-type">
                            {item.type}
                          </div>

                        </div>

                        {item.type === "video" && item.url ? (
                          <video
                            className="teach-video"
                            controls
                            src={item.url}
                          />
                        ) : item.type === "link" && item.url ? (
                          <a
                            className="teach-link"
                            href={item.url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {item.url}
                          </a>
                        ) : null}

                      </div>
                    ))
                  )}

                </div>
              </>
            )}

          </div>

        )}

      </div>

    </div>
  );
};

export default SkillSet;
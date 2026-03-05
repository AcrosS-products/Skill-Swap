import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import axios from "axios";
import "./Navbar.css";
import API_BASE_URL from "../config/api";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const loggedIn = !!userId;
    setIsLoggedIn(loggedIn);

    if (loggedIn) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 10000);
      return () => clearInterval(interval);
    }
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/auth/messages/unread-count`,
        {
          withCredentials: true,
        }
      );
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      if (err.response?.status !== 401 && err.response?.status !== 403) {
        console.error("Error fetching unread count:", err);
      }
    }
  };

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      {/* Hamburger Menu Button - Always visible at top left */}
      <div className="hamburger-btn" onClick={toggleMenu}>
        <div className={menuOpen ? "bar rotate1" : "bar"}></div>
        <div className={menuOpen ? "bar fade" : "bar"}></div>
        <div className={menuOpen ? "bar rotate2" : "bar"}></div>
      </div>

      {/* Overlay to close menu when clicking outside */}
      {menuOpen && <div className="overlay" onClick={closeMenu}></div>}

      {/* Slide-out Navigation Menu */}
      <nav className={`navbar ${menuOpen ? "open" : ""}`}>
        <ul className="nav-links">
          <li>
            <NavLink
              to="/"
              className={({ isActive }) => (isActive ? "active-link" : "")}
              onClick={closeMenu}
            >
              Home
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/auth"
              className={({ isActive }) => (isActive ? "active-link" : "")}
              onClick={closeMenu}
            >
              {isLoggedIn ? "Dashboard" : "Login"}
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/skills"
              className={({ isActive }) => (isActive ? "active-link" : "")}
              onClick={closeMenu}
            >
              Skills
            </NavLink>
          </li>

          {isLoggedIn && (
            <>
              <li>
                <NavLink
                  to="/conversations"
                  className={({ isActive }) => (isActive ? "active-link" : "")}
                  onClick={closeMenu}
                >
                  Messages
                  {unreadCount > 0 && (
                    <span className="nav-badge">{unreadCount}</span>
                  )}
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/my-requests"
                  className={({ isActive }) => (isActive ? "active-link" : "")}
                  onClick={closeMenu}
                >
                  📖 My Requests
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/sessions"
                  className={({ isActive }) => (isActive ? "active-link" : "")}
                  onClick={closeMenu}
                >
                  📚 Sessions
                </NavLink>
              </li>
            </>
          )}

          <li>
            <NavLink
              to="/#"
              className={({ isActive }) => (isActive ? "active-link" : "")}
              onClick={(e) => {
                e.preventDefault();
                closeMenu();
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
              }}
            >
              Contact
            </NavLink>
          </li>
        </ul>
      </nav>
    </>
  );
};

export default Navbar;

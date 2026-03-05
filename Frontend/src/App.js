import "./App.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Chatbot from "./components/Chatbot";

import { Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Skills from "./pages/SkillSet";
import MessagesPage from "./pages/MessagePage";
import ConversationsPage from "./pages/ConversationsPage";
import LearningSessionsPage from "./pages/LearningSessionsPage";
import UserProfile from "./pages/UserProfile";
import MyRequestsPage from "./pages/MyRequestsPage";
import ContentSection from "./pages/ContentSection";

function App() {
  const [user, setUser] = useState(null);

  // ✅ Load user data from localStorage on mount
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const userName = localStorage.getItem("userName");
    const userEmail = localStorage.getItem("userEmail");

    if (userId && userName && userEmail) {
      setUser({
        _id: userId,
        name: userName,
        email: userEmail,
      });
    }
  }, []);

  // ✅ Protected route definition
  const ProtectedRoute = ({ children }) => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      return <Navigate to="/auth" replace />;
    }
    return children;
  };

  return (
    <div className="App">
      {/* App heading */}
      <div className="fix">Skill Swap</div>

      {/* Navbar */}
      <Navbar user={user} />

      {/* Routes */}
      <div className="content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth setUser={setUser} />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard user={user} setUser={setUser} />
              </ProtectedRoute>
            }
          />

          <Route path="/skills" element={<Skills />} />

          <Route
            path="/messages/:tutorId"
            element={
              <ProtectedRoute>
                <MessagesPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/conversations"
            element={
              <ProtectedRoute>
                <ConversationsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/sessions"
            element={
              <ProtectedRoute>
                <LearningSessionsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile/:userId"
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-requests"
            element={
              <ProtectedRoute>
                <MyRequestsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/tutor/:tutorId/content"
            element={
              <ProtectedRoute>
                <ContentSection/>
              </ProtectedRoute>
            }
          />

          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      {/* Chatbot and footer */}
      <Chatbot />
      <Footer />
    </div>
  );
}

export default App;

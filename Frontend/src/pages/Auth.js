import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from 'react-router-dom';
import "react-toastify/dist/ReactToastify.css";

const Auth = ({ setUser }) => {
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    password: "",
    role: "learner",
  });
  const [loginLoading, setLoginLoading] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleSignupChange = (e) => {
    setSignupData({ ...signupData, [e.target.name]: e.target.value });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // allow cookies
        body: JSON.stringify(loginData),
      });

      let data;
      const contentType = res.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error(`Server error: ${text || res.statusText}`);
      }

      if (res.ok) {
        toast.success("Login successful!");

        // Store user info only (NOT token)
        if (data.user) {
          localStorage.setItem("userId", data.user._id);
          localStorage.setItem("userName", data.user.name);
          localStorage.setItem("userEmail", data.user.email);
        }

        console.log("Login successful");

        setUser(data.user);
        navigate("/dashboard");
      } else {
        toast.error(data.message || `Login failed: ${res.status} ${res.statusText}`);
      }

    } catch (err) {
      console.error("Login error:", err);

      if (err.message.includes("Failed to fetch") || err.message.includes("NetworkError")) {
        toast.error("Cannot connect to server. Please check your internet or backend URL.");
      } else {
        toast.error(err.message || "Something went wrong during login!");
      }

    } finally {
      setLoginLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setSignupLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signupData),
      });

      let data;
      const contentType = res.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error(`Server error: ${text || res.statusText}`);
      }

      if (res.ok) {
        toast.success("Sign-Up successful! Please login.");

        setSignupData({
          name: "",
          email: "",
          password: "",
          role: "learner",
        });

      } else {
        toast.error(data.message || `Sign-Up failed: ${res.status} ${res.statusText}`);
      }

      console.log("Response from backend:", data);

    } catch (err) {
      console.error("Signup error:", err);

      if (err.message.includes("Failed to fetch") || err.message.includes("NetworkError")) {
        toast.error("Cannot connect to server. Please check your internet or backend URL.");
      } else {
        toast.error(err.message || "Something went wrong during signup!");
      }

    } finally {
      setSignupLoading(false);
    }
  };

  return (
    <div className="auth-container">

      <ToastContainer position="top-right" autoClose={3000} />

      {/* Login */}
      <div className="auth-box login">
        <h2>Welcome Back</h2>

        <form onSubmit={handleLoginSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={loginData.email}
            onChange={handleLoginChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={loginData.password}
            onChange={handleLoginChange}
            required
          />

          <button type="submit" disabled={loginLoading}>
            {loginLoading ? "Logging in..." : "Login"}
          </button>

          <p className="auth-footer-text">
            New to Skill Swap?{" "}
            <span
              className="auth-link"
              style={{ cursor: "pointer" }}
              onClick={() =>
                window.scrollTo({
                  top: document.querySelector('.auth-box:last-child').offsetTop - 100,
                  behavior: 'smooth'
                })
              }
            >
              Sign up
            </span>
          </p>
        </form>
      </div>

      {/* Signup */}
      <div className="auth-box">
        <h2>Create Account</h2>

        <form onSubmit={handleSignupSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={signupData.name}
            onChange={handleSignupChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={signupData.email}
            onChange={handleSignupChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password (min. 6 characters)"
            value={signupData.password}
            onChange={handleSignupChange}
            required
            minLength={6}
          />

          <button type="submit" disabled={signupLoading}>
            {signupLoading ? "Signing up..." : "Sign Up"}
          </button>

          <p className="auth-footer-text">
            Already have an account?{" "}
            <span
              className="auth-link"
              style={{ cursor: "pointer" }}
              onClick={() =>
                window.scrollTo({
                  top: document.querySelector('.auth-box.login').offsetTop - 100,
                  behavior: 'smooth'
                })
              }
            >
              Login
            </span>
          </p>
        </form>
      </div>

    </div>
  );
};

export default Auth;
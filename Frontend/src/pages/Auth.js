import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import API_BASE_URL from "../config/api";

const Auth = ({ setUser }) => {
  const navigate = useNavigate();

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    password: "",
    role: "learner",
  });

  const [loginLoading, setLoginLoading] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);

  const handleLoginChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSignupChange = (e) => {
    setSignupData({
      ...signupData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(loginData),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Login successful!");

        if (data.user) {
          localStorage.setItem("userId", data.user._id);
          localStorage.setItem("userName", data.user.name);
          localStorage.setItem("userEmail", data.user.email);
        }

        setUser(data.user);
        navigate("/dashboard");
      } else {
        toast.error(data.message || "Login failed");
      }

    } catch (err) {
      console.error("Login error:", err);
      toast.error("Cannot connect to server. Please check backend.");
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(signupData),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Sign-Up successful! Please login.");

        setSignupData({
          name: "",
          email: "",
          password: "",
          role: "learner",
        });
      } else {
        toast.error(data.message || "Signup failed");
      }

    } catch (err) {
      console.error("Signup error:", err);
      toast.error("Cannot connect to server. Please check backend.");
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
        </form>
      </div>
    </div>
  );
};

export default Auth;


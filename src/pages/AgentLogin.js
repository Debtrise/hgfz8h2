import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { message } from "antd";
import "./AuthPages.css";

const AgentLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error for the field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email address is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    console.log("Agent Login: Starting login process...");

    try {
      // Direct API call to login endpoint - fix the URL to avoid duplication
      const response = await axios.post('/auth/login', {
        email: formData.email,
        password: formData.password
      });
      
      console.log("Agent Login response:", response.data);
      
      if (response.data?.token) {
        // Store token in localStorage
        localStorage.setItem('token', response.data.token);
        
        // Store user info with forced AGENT role
        const user = response.data.user || {};
        localStorage.setItem('user', JSON.stringify({
          ...user,
          role: 'AGENT' // Force AGENT role regardless of what the API returns
        }));
        
        if (formData.rememberMe) {
          localStorage.setItem("rememberMe", "true");
        } else {
          localStorage.removeItem("rememberMe");
        }
        
        message.success("Login successful!");
        // Redirect to agent interface
        navigate("/agent");
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Agent Login error:", error);
      message.error("Login failed. Please check your credentials.");
      setErrors({
        form: error.response?.data?.message || error.message || "Failed to login. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = () => {
    navigate("/forgot-password");
  };

  return (
    <div className="auth-container gradient-animation">
      <div className="auth-card">
        <div className="auth-header">
          <div className="logo-container">
            <img src="/logo.png" alt="Knittt Logo" className="auth-logo" />
          </div>
          <h1 className="auth-title">Agent Login</h1>
        </div>

        {errors.form && <div className="form-error-banner">{errors.form}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? "error" : ""}
              placeholder="you@example.com"
              disabled={isSubmitting}
            />
            {errors.email && (
              <div className="error-message">{errors.email}</div>
            )}
          </div>

          <div className="form-group">
            <div className="password-label-row">
              <label htmlFor="password">Password</label>
              <button
                type="button"
                className="forgot-password-link"
                onClick={handleForgotPassword}
              >
                Forgot password?
              </button>
            </div>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? "error" : ""}
              placeholder="••••••••"
              disabled={isSubmitting}
            />
            {errors.password && (
              <div className="error-message">{errors.password}</div>
            )}
          </div>

          <div className="form-checkbox">
            <input
              type="checkbox"
              id="rememberMe"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            <label htmlFor="rememberMe">Remember me</label>
          </div>

          <button type="submit" className="auth-button" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            <Link to="/login" className="auth-link">
              Back to login options
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AgentLogin; 
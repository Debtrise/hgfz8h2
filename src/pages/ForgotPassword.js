import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./AuthPages.css";
import apiService from "../services/apiService";

const ForgotPassword = () => {
  const [formData, setFormData] = useState({
    email: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email address is invalid";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Use apiService to request password reset
      await apiService.auth.forgotPassword(formData.email);

      // Show success message
      setIsSubmitted(true);
    } catch (error) {
      console.error("Password reset request error:", error);
      setErrors({
        form: error.response?.data?.message || "Failed to process your request. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="logo-container">
            <img src="/bds-logo.png" alt="BDS Logo" className="auth-logo" />
          </div>
          <h1 className="auth-title">Reset your password</h1>
        </div>

        {errors.form && <div className="form-error-banner">{errors.form}</div>}

        {isSubmitted ? (
          <div className="success-message">
            <div className="success-icon">✓</div>
            <h2>Email sent</h2>
            <p>
              If an account exists with {formData.email}, we've sent
              instructions to reset your password. Please check your email.
            </p>
            <Link to="/login" className="auth-button secondary-button">
              Return to sign in
            </Link>
          </div>
        ) : (
          <>
            <p className="auth-description">
              Enter your email address and we'll send you a link to reset your
              password.
            </p>

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

              <button
                type="submit"
                className="auth-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Send reset link"}
              </button>
            </form>
          </>
        )}

        <div className="auth-footer">
          <p>
            Remember your password?{" "}
            <Link to="/login" className="auth-link">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import creatorsignup from "../assets/creatorsingup.jpg"; // Using confirmed filename with typo
import "./CreatorSignup.css";

const CreatorSignup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    phone: "",
    email: "",
    dob: "",
    country: "",
    city: "",
    zipCode: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!acceptedTerms) {
      alert("Please accept the Terms & Conditions");
      return;
    }

    try {
      const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const res = await fetch(`${API}/api/auth/register-creator`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Registration failed");
        return;
      }

      alert("Account created successfully! Please login.");
      navigate("/creator-login");
    } catch (err) {
      console.error(err);
      alert("Server error. Please try again later.");
    }
  };

  return (
    <div className="creator-signup-page">
      <button className="back-btn" onClick={() => navigate("/creator-login")}>
        <ArrowLeft size={24} />
      </button>

      <div className="creator-signup-container">
        {/* Left Side: Form */}
        <div className="creator-signup-card">
          <div className="signup-header">
            <h2>Creator Registration</h2>
            <p>
              If you already have an account,{" "}
              <span className="signup-link" onClick={() => navigate("/creator-login")}>
                Login here
              </span>
            </p>
          </div>

          <form className="creator-signup-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Date of Birth</label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Country</label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Zip Code</label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="eye-icon-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="terms-container">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                required
              />
              <span className="terms-text">
                I have read and accept 4Smile's Terms of Use, Privacy Policy, Terms & Conditions
              </span>
            </div>

            <button type="submit" className="signup-submit-btn">
              Confirm Details
            </button>
          </form>
        </div>

        {/* Right Side: Image */}
        <div className="creator-signup-image">
          <img src={creatorsignup} alt="Creator Signup" />
        </div>
      </div>
    </div>
  );
};

export default CreatorSignup;

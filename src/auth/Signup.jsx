import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import carousel2 from "../assets/carousel2.jpg";
import "./Signup.css";

const Signup = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState("customer"); 
  const [step, setStep] = useState("signup"); 
  const [formData, setFormData] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const API = import.meta.env.VITE_API_URL;

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSignup = async (e) => {
    e.preventDefault();
    setMessage("");

    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    try {
      const res = await fetch(`${API}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formData.name, email: formData.email, password: formData.password, role }),
      });
      const data = await res.json();
      if (!res.ok) return setMessage(data.message || "Signup failed");

      setMessage(data.message);
      setStep("verify"); 
    } catch (err) {
      console.error(err);
      setMessage("Server error. Try again later.");
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await fetch(`${API}/api/auth/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, otp }),
      });
      const data = await res.json();
      if (!res.ok) return setMessage(data.message || "OTP verification failed");

      setMessage(data.message);
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      console.error(err);
      setMessage("Server error. Try again later.");
    }
  };

  return (
    <div className="signup-page">
      <button className="back-btn" onClick={() => navigate("/")}>
        ⇦
      </button>

      <div className="signup-container">
        <div className="signup-card">
          <h1 className="signup-title">Create Account</h1>
          <p className="signup-subtitle">Join us and start your journey</p>

          <div className="role-buttons">
            <button
              className={role === "customer" ? "active" : ""}
              onClick={() => setRole("customer")}
            >
              User
            </button>
            <button
              className={role === "photographer" ? "active" : ""}
              onClick={() => setRole("photographer")}
            >
              Photographer
            </button>
          </div>

          {message && <p className="signup-message">{message}</p>}

          {step === "signup" ? (
            <form className="signup-form" onSubmit={handleSignup}>
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                required
              />

              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />

              <label htmlFor="password">Password</label>
              <div className="password-input">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="password-input">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="eye-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <button type="submit" className="signup-submit">
                Sign Up
              </button>
              
              <button type="button" className="google-signin-button">
                <img 
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
                  alt="Google" 
                  className="google-icon"
                />
                Sign in with Google
              </button>
            </form>
          ) : (
            <form className="signup-form" onSubmit={handleVerify}>
              <label htmlFor="otp">Enter OTP</label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP sent to your email"
                required
              />
              <button type="submit" className="signup-submit">
                Verify Email
              </button>
            </form>
          )}

          {step === "verify" && (
            <p className="resend-otp" onClick={async () => {
              try {
                const res = await fetch(`${API}/api/auth/resend-otp`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ email: formData.email }),
                });
                const data = await res.json();
                setMessage(data.message);
              } catch (err) {
                setMessage("Error resending OTP");
              }
            }}>
              Resend OTP
            </p>
          )}

          <p className="login-link">
            Already have an account? <span onClick={() => navigate("/login")}>Login</span>
          </p>
        </div>

        <div className="signup-image">
          <img src={carousel2} alt="Signup" />
        </div>
      </div>
    </div>
  );
};

export default Signup;

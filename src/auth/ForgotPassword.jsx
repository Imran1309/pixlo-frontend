import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import forgetimage from "../assets/forgetimage.jpg";
import otpimage from "../assets/otpimage.jpg";
import "./ForgotPassword.css";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState("email"); // 'email' or 'otp'
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (step === "otp" && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [step]);

  // Send OTP to email
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!email) {
      setMessage("Please enter your email");
      setIsSuccess(false);
      return;
    }

    try {
      const API = import.meta.env.VITE_API_URL;
      const res = await fetch(`${API}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Failed to send OTP");
        setIsSuccess(false);
        return;
      }

      setMessage("OTP sent to your email!");
      setIsSuccess(true);
      setStep("otp");
    } catch (err) {
      console.error(err);
      setMessage("Server error. Try again later.");
      setIsSuccess(false);
    }
  };

  // Verify OTP and redirect to ResetPassword
const handleVerifyOtp = (e) => {
  e.preventDefault();
  const otpValue = otp.join("");
  setMessage("");

  if (otpValue.length !== 6) {
    setMessage("Please enter a valid 6-digit OTP");
    setIsSuccess(false);
    return;
  }

  // ✅ Do NOT call /reset-password here
  navigate("/reset-password", { state: { email, otp: otpValue } });
};


  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value !== "" && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  return (
    <div className="forgot-page">
      <button className="back-btn" onClick={() => navigate("/")}>
        ⇦
      </button>

      <div className="forgot-container">
        <div className="forgot-image">
          <img
            src={step === "email" ? forgetimage : otpimage}
            alt={step === "email" ? "Forgot Password" : "Verify OTP"}
          />
        </div>
        <div className="forgot-card">
          <div className="forgot-header">
            <h2>{step === "email" ? "FORGOT PASSWORD" : "ENTER OTP"}</h2>
            <p>
              {step === "email"
                ? "No worries — it happens!"
                : "We sent a 6-digit code to your email"}
            </p>
            {step === "email" && <p>Enter your email to reset your password.</p>}
            {step === "otp" && <p>{`Enter the code sent to ${email}`}</p>}
          </div>

          {message && (
            <p className={`forgot-message ${isSuccess ? "success" : "error"}`}>
              {message}
            </p>
          )}

          {step === "email" ? (
            <form onSubmit={handleSendOtp}>
              <label>Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit">Send OTP</button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp}>
              <div className="otp-container">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength="1"
                    className="otp-input"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    ref={(ref) => (inputRefs.current[index] = ref)}
                    required
                  />
                ))}
              </div>
              <button type="submit">Verify OTP</button>
            </form>
          )}

          <p className="back-to-login">
            Remember your password?{" "}
            <span onClick={() => navigate("/login")}>Back to Login</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

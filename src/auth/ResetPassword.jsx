import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, useLocation } from "react-router-dom";
import "./ResetPassword.css";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { email, otp } = location.state || {}; // get from navigation
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    if (!email || !otp) {
      navigate("/forgot-password"); // redirect if accessed directly
    }
  }, [email, otp, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const API = import.meta.env.VITE_API_URL;
      const res = await fetch(`${API}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message, {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });

        // Wait for toast to show before navigating
        setTimeout(() => navigate("/login"), 1500);
      } else {
        toast.error(data.message, {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    } catch (err) {
      toast.error("Server error. Try again later.", {
        position: "top-center",
        autoClose: 3000,
      });
      console.error(err);
    }
  };

  return (
    <div className="reset-password-container">
      <h2>Reset Password</h2>
      <form onSubmit={handleSubmit}>
        <label>New Password</label>
        <input
          type="password"
          placeholder="Enter new password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <button type="submit">Reset Password</button>
      </form>
      <ToastContainer />
    </div>
  );
};

export default ResetPassword;

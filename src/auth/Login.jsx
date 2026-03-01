import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import carousel2 from "../assets/carousel2.jpg";
import "./Login.css";
import { useGoogleLogin } from "@react-oauth/google";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [keepLogin, setKeepLogin] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const API = import.meta.env.VITE_API_URL;

      const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Login failed");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setMessage("Login successful!");
      setEmail("");
      setPassword("");

      navigate("/");
    } catch (err) {
      console.error(err);
      setMessage("Server error. Try again later.");
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
        const res = await fetch(`${API}/api/auth/google-login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ access_token: tokenResponse.access_token }),
        });

        const data = await res.json();

        if (!res.ok) {
          setMessage(data.message || "Google Login failed");
          return;
        }

        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        setMessage("Login successful!");
        navigate("/");
      } catch (err) {
        console.error(err);
        setMessage("Server error. Try again later.");
      }
    },
    onError: () => setMessage("Google Login Failed"),
  });

  return (
    <div className="login-page">
      <button className="back-btn" onClick={() => navigate(-1)}>
        <ArrowLeft size={24} />
      </button>

      <div className="login-container">
        <div className="login-card">
          <div className="login-content-wrapper">
            <div className="login-header">
              <h2>Welcome Back 👋</h2>
              <p>
                Today is a new day. It's your day. You shape it. <br />
                Sign in to start managing your projects.
              </p>
            </div>

            {message && <p className="message">{message}</p>}

            <form onSubmit={handleLogin} className="login-form">
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="text"
                  id="email"
                  value={email}
                  placeholder="Example@email.com"
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="password-input">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    placeholder="at least 8 characters"
                    onChange={(e) => setPassword(e.target.value)}
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
                <div className="forgot-password-row">
                  <span
                    className="forgot-password-link"
                    onClick={() => navigate("/forgot-password")}
                  >
                    Forgot Password?
                  </span>
                </div>
              </div>

              <button type="submit" className="login-submit-btn">
                Sign in
              </button>

              <div className="divider">
                <span>Or</span>
              </div>

              <button type="button" className="google-signin-btn" onClick={() => handleGoogleLogin()}>
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt="Google"
                  className="google-icon"
                />
                Sign in with Google
              </button>
            </form>

            <p className="signup-text">
              Don't you have an account?{" "}
              <span className="signup-link" onClick={() => navigate("/signup")}>
                Sign up
              </span>
            </p>

          </div>

          <div className="login-footer">
            <p>© 2025 ALL RIGHTS RESERVED</p>
          </div>
        </div>

        <div className="login-image">
          <img src={carousel2} alt="Photographer with Camera" />
        </div>
      </div>
    </div>
  );
};

export default Login;

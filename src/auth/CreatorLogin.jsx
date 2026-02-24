import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import creatorlogin from "../assets/creatorlogin.jpg";
import "./CreatorLogin.css";
import { useGoogleLogin } from "@react-oauth/google";
import FacebookLogin from '@greatsumini/react-facebook-login';

const CreatorLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Invalid email or password");
        return;
      }

      console.log("Creator Login Success", data);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);

      navigate("/profile");
    } catch (err) {
      console.error(err);
      alert("Server error. Please try again later.");
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
          body: JSON.stringify({ access_token: tokenResponse.access_token, role: "photographer" }),
        });

        const data = await res.json();

        if (!res.ok) {
          alert(data.message || "Google Login failed");
          return;
        }

        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        navigate("/profile");
      } catch (err) {
        console.error(err);
        alert("Server error. Try again later.");
      }
    },
    onError: () => alert("Google Login Failed"),
  });

  const fbAppId = import.meta.env.VITE_FACEBOOK_APP_ID || "1234567890"; // Fallback dummy ID

  const handleFacebookSuccess = async (response) => {
    try {
      const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const res = await fetch(`${API}/api/auth/facebook-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ access_token: response.accessToken, role: "photographer" }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Facebook Login failed");
        return;
      }

      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);
      navigate("/profile");
    } catch (err) {
      console.error(err);
      alert("Server error. Try again later.");
    }
  };

  return (
    <div className="creator-login-page">
      <button className="back-btn" onClick={() => navigate("/")}>
        <ArrowLeft size={24} />
      </button>

      <div className="creator-login-container">
        {/* Left Side: Content */}
        <div className="creator-login-card">
          <div className="creator-header">
            <h2>Welcome back,</h2>
            <p>
              Don't have an account,{" "}
              <span className="creator-link" onClick={() => navigate("/creator-signup")}>
                Create new account
              </span>
            </p>
          </div>

          <div className="creator-social-row">
            <FacebookLogin
              appId={fbAppId}
              onSuccess={handleFacebookSuccess}
              onFail={(error) => {
                console.log('Facebook Login Failed', error);
                if(error.status !== 'unknown') {
                    alert("Facebook Login Failed");
                }
              }}
              onProfileSuccess={(response) => {
                console.log('Get Profile Success', response);
              }}
              render={({ onClick }) => (
                <button 
                  type="button" 
                  className="creator-social-btn facebook" 
                  onClick={onClick}
                >
                  <svg className="social-icon-sm" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.954 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Sign in with Facebook
                </button>
              )}
            />
            <button 
               type="button" 
               className="creator-social-btn google" 
               onClick={() => handleGoogleLogin()}
            >
              <img 
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
                alt="Google" 
                className="social-icon-sm"
              />
              Sign in with Google
            </button>
          </div>

          <div className="creator-divider">
            <span>OR</span>
          </div>

          <form className="creator-form" onSubmit={handleLogin}>
            <label htmlFor="email">Email or Name</label>
            <input
              type="text"
              id="email"
              value={email}
              placeholder="acb123@gmail.com"
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label htmlFor="password">Password</label>
            <div className="creator-password-input">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                placeholder="********"
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="creator-eye-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <button type="submit" className="creator-login-btn">
              Login
            </button>
          </form>
        </div>

        {/* Right Side: Image */}
        <div className="creator-login-image">
          <img src={creatorlogin} alt="Creator Login" />
        </div>
      </div>
    </div>
  );
};

export default CreatorLogin;

import React, { useEffect, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { User, LogOut, ArrowLeft, Menu, X } from "lucide-react";
import logo from "./assets/logo.jpg";
import "./Navbar.css";

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const location = useLocation();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  // Close menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <header className="navbar">
      <div className="navbar-left">
        {location.pathname !== "/" && (
          <button onClick={() => navigate(-1)} className="nav-back-btn">
            <ArrowLeft size={24} />
          </button>
        )}
        <img src={logo} alt="Logo" className="navbar-logo" onClick={() => navigate("/")} />
        <NavLink to="/creators" className="navbar-text" style={{ textDecoration: 'none' }}>EXPLORE CREATORS</NavLink>
      </div>

      <div className="navbar-right">
        <nav className={`nav-links ${mobileMenuOpen ? "open" : ""}`}>
          {!user ? (
            <>
              <NavLink to="/login" className="nav-btn gold-btn">Login</NavLink>
              <NavLink to="/creator-signup" className="nav-btn gold-btn">Join as Creator</NavLink>
            </>
          ) : (
            <>
              {user.role === "photographer" ? (
                <>
                  <NavLink to="/bookings">Bookings</NavLink>
                  <NavLink to="/portfolio">Portfolio</NavLink>
                  <NavLink to={`/photographer/${user._id}/reviews`}>Reviews</NavLink>
                </>
              ) : (
                <>
                  <NavLink to="/creators">Find Creators</NavLink>
                  <NavLink to="/my-bookings">My Bookings</NavLink>
                </>
              )}

              <NavLink to="/profile" className="profile-link">
                <User size={20} /> Profile
              </NavLink>

              <button onClick={handleLogout} className="logout-btn">
                <LogOut size={20} /> Logout
              </button>
            </>
          )}
        </nav>

        <button
          className="hamburger"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>
    </header>
  );
};

export default Navbar;

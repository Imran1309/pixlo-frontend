import React, { useEffect, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { User, LogOut, ArrowLeft } from "lucide-react";
import logo from "./assets/logo.jpg"; 
import "./Navbar.css"; 

const Navbar = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const location = useLocation();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

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

      <nav className="nav-links">
        
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
    </header>
  );
};

export default Navbar;

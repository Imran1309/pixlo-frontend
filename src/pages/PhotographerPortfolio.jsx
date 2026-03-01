import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./PhotographerPortfolio.css";
import logo from "../assets/logo.jpg";
import defaultProfile from "../assets/default-profile-pic.png";
import { ChevronLeft } from "lucide-react";

const PhotographerPortfolio = () => {
  const [photographer, setPhotographer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const navigate = useNavigate();

  // Basic portfolio form
  const [form, setForm] = useState({
    introduction: "",
    yearsOfExperience: "",
    typeOfWork: "", // Photographer, Videographer, Both
    specialization: [],
    location: "", // Changed from lat/long to a select/string for specific design if needed, or keep logic
    latitude: "",
    longitude: "",
  });

  // Services form & others (kept for logic but might be hidden in this step if it's just 'About You')
  // The screenshot implies this is a "Setup" step.
  // We will prioritize the "About You" view.

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);
    const userId = storedUser?._id;

    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        // If mock user
        if (localStorage.getItem("token") === "mock-creator-token") {
          // Mock behavior
          setLoading(false);
          return;
        }

        const res = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/photographers/profile/${userId}`
        );
        setPhotographer(res.data.photographer);

        if (res.data.photographer) {
          const p = res.data.photographer;
          setForm((prev) => ({
            ...prev,
            introduction: p.introduction || "",
            yearsOfExperience: p.yearsOfExperience || "",
            typeOfWork: p.typeOfWork || "",
            specialization: p.specialization || [],
            latitude: p.location?.coordinates ? p.location.coordinates[1] : "",
            longitude: p.location?.coordinates ? p.location.coordinates[0] : "",
          }));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleTypeChange = (type) => {
    setForm(prev => ({ ...prev, typeOfWork: type }));
  };

  const handleSpecialization = (spec) => {
    setForm((prev) => {
      const specs = prev.specialization.includes(spec)
        ? prev.specialization.filter(item => item !== spec)
        : [...prev.specialization, spec];

      // Limit to 5
      if (specs.length > 5) return prev;

      return { ...prev, specialization: specs };
    });
  };

  const handleSubmit = async () => {
    console.log("Saving form:", form);
    try {
      if (localStorage.getItem("token") === "mock-creator-token") {
        alert("Saved (Mock)!");
        navigate("/portfolio/media");
        return;
      }

      const userId = user._id;

      // Geocode the selected city name to get real lat/lng
      let locationPayload = null;
      if (form.location) {
        try {
          const geoRes = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(form.location)}&limit=1`,
            { headers: { 'User-Agent': 'Pixlo App' } }
          );
          const geoData = await geoRes.json();
          if (geoData && geoData.length > 0) {
            const { lat, lon } = geoData[0];
            locationPayload = {
              type: 'Point',
              coordinates: [parseFloat(lon), parseFloat(lat)]
            };
          }
        } catch (geoErr) {
          console.warn('Geocoding failed:', geoErr.message);
        }
      }

      // Use manual lat/lng if provided, override geocoded
      if (form.latitude && form.longitude) {
        locationPayload = {
          type: 'Point',
          coordinates: [parseFloat(form.longitude), parseFloat(form.latitude)]
        };
      }

      const payload = {
        userId,
        introduction: form.introduction,
        yearsOfExperience: form.yearsOfExperience,
        typeOfWork: form.typeOfWork,
        specialization: form.specialization,
      };

      if (locationPayload) {
        payload.location = locationPayload;
      }

      await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/photographers/profile`,
        payload,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      navigate("/portfolio/media");
    } catch (err) {
      console.error(err);
      alert("Failed to save profile. Please try again.");
    }
  };

  if (loading) return <div style={{ background: '#000', height: '100vh', color: 'white' }}>Loading...</div>;

  const specializationsList = [
    "Portrait", "Wedding", "Event",
    "Commercial", "Product", "Landscape",
    "Documentary", "Aerial/Drone", "Fashion", "Instagram Reels"
  ];

  return (
    <div className="about-you-page">
      {/* Header */}
      <div className="portfolio-header">
        <div className="header-left">
          {/* <ChevronLeft size={30} style={{cursor:'pointer', color:'#fff'}} onClick={() => navigate(-1)} /> */}
          <img src={logo} alt="Pixlo" className="header-logo" onClick={() => navigate("/")} style={{ cursor: "pointer" }} />

        </div>
        <h2>About you</h2>
        <div className="header-right">
          <div className="user-avatar-small">
            <img src={user?.profilePic || defaultProfile} alt="Profile" />
          </div>
        </div>
      </div>

      <div className="about-content">

        {/* Bio Section */}
        <div className="form-section">
          <h3>Short Bio/Introduction</h3>
          <p className="sub-label">Share your story,and what makes you unique as a creator</p>
          <div className="rich-text-area">
            <div className="rich-text-toolbar">
              <span>Roboto</span>
              <span>Paragraph</span>
            </div>
            <textarea
              name="introduction"
              value={form.introduction}
              onChange={handleChange}
              placeholder="Your text goes here"
            ></textarea>
          </div>
        </div>

        <div className="form-row-grid">

          {/* Experience */}
          <div className="form-group">
            <h3>Years Of Experience</h3>
            <div className="custom-number-input">
              <input
                type="number"
                name="yearsOfExperience"
                value={form.yearsOfExperience}
                onChange={handleChange}
                min="0"
              />
              <div className="spinners">
                <button type="button" onClick={() => setForm(p => ({ ...p, yearsOfExperience: Number(p.yearsOfExperience) + 1 }))}>▲</button>
                <button type="button" onClick={() => setForm(p => ({ ...p, yearsOfExperience: Math.max(0, Number(p.yearsOfExperience) - 1) }))}>▼</button>
              </div>
            </div>
          </div>

          {/* Type of Work */}
          <div className="form-group">
            <h3>Type of work</h3>
            <div className="checkbox-group-vertical">
              <label className="custom-checkbox">
                <input
                  type="checkbox"
                  checked={form.typeOfWork === "Photographer" || form.typeOfWork === "Both"}
                  onChange={() => handleTypeChange("Photographer")}
                />
                <span className="checkmark"></span>
                Photographer
              </label>
              <label className="custom-checkbox">
                <input
                  type="checkbox"
                  checked={form.typeOfWork === "Videographer" || form.typeOfWork === "Both"}
                  onChange={() => handleTypeChange("Videographer")}
                />
                <span className="checkmark"></span>
                Videographer
              </label>
              <label className="custom-checkbox">
                <input
                  type="checkbox"
                  checked={form.typeOfWork === "Both"}
                  onChange={() => handleTypeChange("Both")}
                />
                <span className="checkmark"></span>
                Both
              </label>
            </div>
          </div>

          {/* Location */}
          <div className="form-group">
            <h3>Location</h3>
            <select
              name="location"
              value={form.location || "Hyderabad"} // Default or state
              onChange={handleChange}
              className="custom-select"
            >
              <option value="Hyderabad">Hyderabad</option>
              <option value="Bangalore">Bangalore</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Delhi">Delhi</option>
              <option value="Chennai">Chennai</option>
            </select>
          </div>

        </div>

        {/* Specialization */}
        <div className="form-section">
          <h3>Years Of Experience</h3> {/* Keeping title as per screenshot even if it seems duplicate/typo */}
          <p className="sub-label">Select up to 5 areas you specialize in</p>

          <div className="specialization-grid">
            {specializationsList.map(spec => (
              <label key={spec} className="custom-checkbox">
                <input
                  type="checkbox"
                  checked={form.specialization.includes(spec)}
                  onChange={() => handleSpecialization(spec)}
                />
                <span className="checkmark"></span>
                {spec}
              </label>
            ))}
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="form-footer">
          <button className="btn-back" onClick={() => navigate('/profile')}>Back</button>
          <button className="btn-continue" onClick={handleSubmit}>Continue</button>
        </div>

      </div>
    </div>
  );
};

export default PhotographerPortfolio;

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../assets/logo.jpg";
import defaultProfile from "../assets/default-profile-pic.png";
import { Calendar, Check, Minus } from "lucide-react";
import "./PhotographerAvailability.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const PhotographerAvailability = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const [saving, setSaving] = useState(false);

  // Availability grid: rows = [morning, afternoon, evening], cols = [Mon-Sun]
  const [availability, setAvailability] = useState({
    morning: [false, true, true, true, true, false, true],
    afternoon: [true, true, false, true, true, true, false],
    evening: [true, false, false, true, false, true, true],
  });

  const [exceptions, setExceptions] = useState([]);
  const [leadTime, setLeadTime] = useState("Require 1 week advance notice");

  const leadTimeOptions = [
    "Same day bookings allowed",
    "Require 1 day advance notice",
    "Require 2 days advance notice",
    "Require 3 days advance notice",
    "Require 1 week advance notice",
    "Custom",
  ];

  const days = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
  const dayKeys = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];

  // Load existing availability on mount
  useEffect(() => {
    const loadExisting = async () => {
      if (!user?._id) return;
      try {
        const res = await axios.get(
          `${API_URL}/api/photographers/profile/${user._id}`,
        );
        const p = res.data.photographer;
        if (p && p.availability) {
          const avail = p.availability;
          const newMorning = dayKeys.map((d) =>
            (avail[d] || []).includes("morning"),
          );
          const newAfternoon = dayKeys.map((d) =>
            (avail[d] || []).includes("afternoon"),
          );
          const newEvening = dayKeys.map((d) =>
            (avail[d] || []).includes("evening"),
          );

          if (
            newMorning.some(Boolean) ||
            newAfternoon.some(Boolean) ||
            newEvening.some(Boolean)
          ) {
            setAvailability({
              morning: newMorning,
              afternoon: newAfternoon,
              evening: newEvening,
            });
          }
        }
      } catch (err) {
        console.warn("Could not load existing availability:", err.message);
      }
    };
    loadExisting();
  }, []);

  const toggleSlot = (timeOfDay, dayIndex) => {
    setAvailability((prev) => ({
      ...prev,
      [timeOfDay]: prev[timeOfDay].map((val, idx) =>
        idx === dayIndex ? !val : val,
      ),
    }));
  };

  const handleAddException = () => {
    const title = prompt("Enter exception title (e.g. Holiday):");
    if (!title) return;
    const date = prompt("Enter date or range (e.g. Dec 25, 2025):");
    if (!date) return;
    setExceptions((prev) => [
      ...prev,
      { id: Date.now(), title, desc: "Not available", date },
    ]);
  };

  const handleBack = () => {
    navigate("/portfolio/services");
  };

  const handlePublish = async () => {
    if (!user?._id) {
      alert("Please log in to publish your profile.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        userId: user._id,
        availability: {
          morning: availability.morning,
          afternoon: availability.afternoon,
          evening: availability.evening,
        },
      };

      await axios.put(`${API_URL}/api/photographers/availability`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert(
        "🎉 Profile Published! Your profile is now live for clients to book you.",
      );
      navigate("/");
    } catch (err) {
      console.error("Error publishing availability:", err);
      alert(
        "Failed to save availability. Your profile may still be incomplete.",
      );
      // Navigate anyway so user isn't stuck
      navigate("/");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="availability-page">
      {/* Header */}
      <div className="portfolio-header">
        <div className="header-left">
          <img
            src={logo}
            alt="Pixlo"
            className="header-logo"
            onClick={() => navigate("/")}
            style={{ cursor: "pointer" }}
          />
          <h2>Availability</h2>
        </div>
        <div className="header-right">
          <div className="user-avatar-small">
            <img src={user?.profilePic || defaultProfile} alt="Profile" />
          </div>
        </div>
      </div>

      <div className="availability-content">
        <h3>Weekly Availability</h3>
        <p>
          Set your recurring weekly schedule. Clients will only be able to book
          during these times.
        </p>

        <div className="grid-container">
          <div className="availability-grid">
            {/* Header Row */}
            <div className="grid-header"></div>
            {days.map((day, i) => (
              <div key={i} className="grid-header">
                {day}
              </div>
            ))}

            {/* Morning Row */}
            <div className="time-slot-label">
              <h4>MORNING</h4>
              <span>6am-12pm</span>
            </div>
            {availability.morning.map((isAvailable, i) => (
              <div
                key={`m-${i}`}
                className="slot-cell"
                onClick={() => toggleSlot("morning", i)}
              >
                {isAvailable ? (
                  <Check className="icon-check" />
                ) : (
                  <Minus className="icon-minus" />
                )}
              </div>
            ))}

            {/* Afternoon Row */}
            <div className="time-slot-label">
              <h4>AFTERNOON</h4>
              <span>1pm-5pm</span>
            </div>
            {availability.afternoon.map((isAvailable, i) => (
              <div
                key={`a-${i}`}
                className="slot-cell"
                onClick={() => toggleSlot("afternoon", i)}
              >
                {isAvailable ? (
                  <Check className="icon-check" />
                ) : (
                  <Minus className="icon-minus" />
                )}
              </div>
            ))}

            {/* Evening Row */}
            <div className="time-slot-label">
              <h4>EVENING</h4>
              <span>6pm-9pm</span>
            </div>
            {availability.evening.map((isAvailable, i) => (
              <div
                key={`e-${i}`}
                className="slot-cell"
                onClick={() => toggleSlot("evening", i)}
              >
                {isAvailable ? (
                  <Check className="icon-check" />
                ) : (
                  <Minus className="icon-minus" />
                )}
              </div>
            ))}
          </div>
        </div>

        <h3>Custom Date Exceptions</h3>
        <p>
          Add specific dates when you're unavailable or have special
          availability.
        </p>

        <div className="exceptions-container">
          {exceptions.map((exc) => (
            <div className="exception-box" key={exc.id}>
              <h4>{exc.title}</h4>
              <p>{exc.desc}</p>
              <div className="date-display">
                <Calendar size={16} color="#b3995e" />
                <span>{exc.date}</span>
              </div>
            </div>
          ))}
        </div>

        <button className="add-exception-btn" onClick={handleAddException}>
          + Add Date Exception
        </button>

        <div className="lead-time-container">
          <h3>Booking Lead Time</h3>
          <p style={{ marginBottom: "0" }}>
            How much advance notice do you need before a booking?
          </p>
          <div className="lead-time-options">
            {leadTimeOptions.map((option, idx) => (
              <label className="radio-option" key={idx}>
                <input
                  type="checkbox"
                  name="leadTime"
                  checked={leadTime === option}
                  onChange={() => setLeadTime(option)}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="footer-buttons">
          <button className="btn-back-avail" onClick={handleBack}>
            Back
          </button>
          <button
            className="btn-publish"
            onClick={handlePublish}
            disabled={saving}
            style={{
              opacity: saving ? 0.7 : 1,
              cursor: saving ? "not-allowed" : "pointer",
            }}
          >
            {saving ? "Publishing..." : "PUBLISH MY PROFILE"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PhotographerAvailability;

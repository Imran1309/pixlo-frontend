import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.jpg";
import defaultProfile from "../assets/default-profile-pic.png";
import { Calendar, Check, Minus } from "lucide-react";
import "./PhotographerAvailability.css";

const PhotographerAvailability = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user"));

    // State for grid: rows x columns (3 x 7)
    // 0: Morning, 1: Afternoon, 2: Evening
    // 0: Mon, 1: Tue ... 6: Sun
    // Value: true (available/check), false (unavailable/minus)
    const [availability, setAvailability] = useState({
        morning: [false, true, true, true, true, false, true], // Mon-Sun
        afternoon: [true, true, false, true, true, true, false],
        evening: [true, false, false, true, false, true, true]
    });

    const [exceptions, setExceptions] = useState([
        { id: 1, title: "WORKSHOP DAY", desc: "Only available evenings", date: "NOV 5,2025" },
        { id: 2, title: "Vacation", desc: "Not availble for bookings", date: "Oct 15 2025 - Oct 22 2025" }
    ]);

    const handleAddException = () => {
        // For simplicity, using prompt. In a real app, a modal is better.
        const title = prompt("Enter exception title (e.g. Holiday):");
        if (!title) return;
        const date = prompt("Enter date or range (e.g. Dec 25):");
        if (!date) return;
        
        setExceptions(prev => [
            ...prev,
            { id: Date.now(), title, desc: "Not available", date }
        ]);
    };

    const days = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

    const [leadTime, setLeadTime] = useState("Require 1 week advance notice");

    const leadTimeOptions = [
        "Same day bookings allowed",
        "Require 1 day advance notice",
        "Require 2 days advance notice",
        "Require 3 days advance notice",
        "Require 1 week advance notice",
        "Custom"
    ];

    const toggleSlot = (timeOfDay, dayIndex) => {
        setAvailability(prev => ({
            ...prev,
            [timeOfDay]: prev[timeOfDay].map((val, idx) => idx === dayIndex ? !val : val)
        }));
    };

    const handleBack = () => {
        navigate("/portfolio/services");
    };

    const handlePublish = () => {
        // Finalize / Publish logic
        const newProfile = {
            name: user?.name || "New Creator",
            image: user?.profilePic || defaultProfile,
            specialty: "Professional Photographer",
            desc: "Ready to capture your special moments with creativity and passion. Book me for your next event!"
        };
        
        localStorage.setItem("publishedProfile", JSON.stringify(newProfile));
        
        alert("Profile Published!");
        // Navigate to Home page and scroll to How It Works section
        window.location.href = "/#how";
    };

    return (
        <div className="availability-page">
            {/* Header - Matching 'Service & Pricing' from screenshot */}
            <div className="portfolio-header">
                <div className="header-left">
                    <img src={logo} alt="Pixlo" className="header-logo" />
                    <h2>Service & Pricing</h2>
                </div>
                <div className="header-right">
                    <div className="user-avatar-small">
                        <img src={user?.profilePic || defaultProfile} alt="Profile" />
                    </div>
                </div>
            </div>

            <div className="availability-content">
                <h3>Weekly Availability</h3>
                <p>Set your recurring weekly schedule. Clients will only be able to book during these times.</p>

                <div className="grid-container">
                    <div className="availability-grid">
                        {/* Header Row */}
                        <div className="grid-header"></div> {/* Empty top-left */}
                        {days.map((day, i) => (
                            <div key={i} className="grid-header">{day}</div>
                        ))}

                        {/* Morning Row */}
                        <div className="time-slot-label">
                            <h4>MORNING</h4>
                            <span>6am-12pm</span>
                        </div>
                        {availability.morning.map((isAvailable, i) => (
                            <div key={`m-${i}`} className="slot-cell" onClick={() => toggleSlot('morning', i)}>
                                {isAvailable ? <Check className="icon-check" /> : <Minus className="icon-minus" />}
                            </div>
                        ))}

                        {/* Afternoon Row */}
                        <div className="time-slot-label">
                            <h4>AFTERNOON</h4>
                            <span>1pm-5pm</span>
                        </div>
                        {availability.afternoon.map((isAvailable, i) => (
                            <div key={`a-${i}`} className="slot-cell" onClick={() => toggleSlot('afternoon', i)}>
                                {isAvailable ? <Check className="icon-check" /> : <Minus className="icon-minus" />}
                            </div>
                        ))}

                        {/* Evening Row */}
                        <div className="time-slot-label">
                            <h4>EVENING</h4>
                            <span>6pm-9pm</span>
                        </div>
                        {availability.evening.map((isAvailable, i) => (
                            <div key={`e-${i}`} className="slot-cell" onClick={() => toggleSlot('evening', i)}>
                                {isAvailable ? <Check className="icon-check" /> : <Minus className="icon-minus" />}
                            </div>
                        ))}
                    </div>
                </div>

                <h3>Custom Date Exceptions</h3>
                <p>Add specific dates when you're unavailable or have special availability.</p>

                <div className="exceptions-container">
                    {exceptions.map(exc => (
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

                <button className="add-exception-btn" onClick={handleAddException}>Add Date Exception</button>

                <div className="lead-time-container">
                    <h3>Booking Lead Time</h3>
                    <p style={{marginBottom: '0'}}>How much advance notice do you need before a booking?</p>
                    
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
                    <button className="btn-back-avail" onClick={handleBack}>Back</button>
                    <button className="btn-publish" onClick={handlePublish}>PUBLISH MY PROFILE</button>
                </div>
            </div>
        </div>
    );
};

export default PhotographerAvailability;

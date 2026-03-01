import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../assets/logo.jpg";
import defaultProfile from "../assets/default-profile-pic.png";
import { Lightbulb } from "lucide-react";
import "./PhotographerServices.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const PhotographerServices = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const [saving, setSaving] = useState(false);
  const [loadingExisting, setLoadingExisting] = useState(true);

  const [services, setServices] = useState([
    {
      id: Date.now(),
      name: "",
      description: "",
      duration: 1,
      price: 0,
      deliverables: "",
    },
  ]);

  // Load existing services on mount
  useEffect(() => {
    const loadExisting = async () => {
      if (!user?._id) {
        setLoadingExisting(false);
        return;
      }
      try {
        const res = await axios.get(
          `${API_URL}/api/photographers/profile/${user._id}`,
        );
        const photographer = res.data.photographer;
        if (
          photographer &&
          photographer.services &&
          photographer.services.length > 0
        ) {
          const mapped = photographer.services.map((s, i) => ({
            id: s._id || Date.now() + i,
            name: s.serviceName || "",
            description: s.description || "",
            duration: s.durationHours || 1,
            price: s.priceINR || 0,
            deliverables: s.deliverables || "",
          }));
          setServices(mapped);
        }
      } catch (err) {
        console.warn("Could not load existing services:", err.message);
      } finally {
        setLoadingExisting(false);
      }
    };
    loadExisting();
  }, []);

  const handleAddService = () => {
    setServices((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: "",
        description: "",
        duration: 1,
        price: 0,
        deliverables: "",
      },
    ]);
  };

  const handleRemoveService = (id) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
  };

  const handleInputChange = (id, field, value) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
    );
  };

  const handleContinue = async () => {
    // Validate
    const invalid = services.find((s) => !s.name || !s.price);
    if (invalid) {
      alert("Please fill in service name and price for all services.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        userId: user._id,
        services: services.map((s) => ({
          serviceName: s.name,
          description: s.description,
          priceINR: Number(s.price),
          durationHours: Number(s.duration),
          deliverables: s.deliverables,
        })),
      };

      await axios.put(`${API_URL}/api/photographers/services`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      navigate("/portfolio/availability");
    } catch (err) {
      console.error("Error saving services:", err);
      alert("Failed to save services. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    navigate("/portfolio/media");
  };

  if (loadingExisting) {
    return (
      <div
        className="services-page"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
        }}
      >
        <div style={{ color: "#fff", fontSize: "1.2rem" }}>
          Loading your services...
        </div>
      </div>
    );
  }

  return (
    <div className="services-page">
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
          <h2>Service &amp; Pricing</h2>
        </div>
        <div className="header-right">
          <div className="user-avatar-small">
            <img src={user?.profilePic || defaultProfile} alt="Profile" />
          </div>
        </div>
      </div>

      <div className="services-content">
        <h3 className="services-page-title">Service &amp; Pricing</h3>
        <p className="services-page-subtitle">
          Define the photography and videography services you offer to clients
        </p>

        <div className="services-grid">
          {services.map((service, index) => (
            <div className="service-card" key={service.id}>
              <div
                className="service-card-header"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>Service #{index + 1}</span>
                {services.length > 1 && (
                  <button
                    onClick={() => handleRemoveService(service.id)}
                    className="remove-service-btn"
                    title="Remove Service"
                  >
                    ✖
                  </button>
                )}
              </div>

              {/* Name */}
              <div className="input-group">
                <label>Service Name *</label>
                <input
                  type="text"
                  className="dark-input-service"
                  value={service.name}
                  onChange={(e) =>
                    handleInputChange(service.id, "name", e.target.value)
                  }
                  placeholder="e.g. 1 Hour portrait shoot"
                />
              </div>

              {/* Description */}
              <div className="input-group">
                <label>Description</label>
                <div className="desc-box-service">
                  <div className="desc-toolbar-service">
                    <span>Roboto</span> <span>Paragraph</span>
                  </div>
                  <textarea
                    className="desc-input-service"
                    value={service.description}
                    onChange={(e) =>
                      handleInputChange(
                        service.id,
                        "description",
                        e.target.value,
                      )
                    }
                    placeholder="Describe what's included in this service"
                  ></textarea>
                </div>
              </div>

              {/* Duration & Price */}
              <div className="row-2-col">
                <div className="input-group">
                  <label>Duration (hours)</label>
                  <div className="number-input-container">
                    <input
                      type="number"
                      className="number-input-field"
                      value={service.duration}
                      min="0.5"
                      step="0.5"
                      onChange={(e) =>
                        handleInputChange(
                          service.id,
                          "duration",
                          e.target.value,
                        )
                      }
                    />
                    <div className="spinner-btns">
                      <button
                        className="spinner-btn"
                        onClick={() =>
                          handleInputChange(
                            service.id,
                            "duration",
                            Number(service.duration) + 0.5,
                          )
                        }
                      >
                        ▲
                      </button>
                      <button
                        className="spinner-btn"
                        onClick={() =>
                          handleInputChange(
                            service.id,
                            "duration",
                            Math.max(0.5, Number(service.duration) - 0.5),
                          )
                        }
                      >
                        ▼
                      </button>
                    </div>
                  </div>
                </div>
                <div className="input-group">
                  <label>Price (₹) *</label>
                  <div className="number-input-container">
                    <input
                      type="number"
                      className="number-input-field"
                      value={service.price}
                      min="0"
                      onChange={(e) =>
                        handleInputChange(service.id, "price", e.target.value)
                      }
                    />
                    <div className="spinner-btns">
                      <button
                        className="spinner-btn"
                        onClick={() =>
                          handleInputChange(
                            service.id,
                            "price",
                            Number(service.price) + 100,
                          )
                        }
                      >
                        ▲
                      </button>
                      <button
                        className="spinner-btn"
                        onClick={() =>
                          handleInputChange(
                            service.id,
                            "price",
                            Math.max(0, Number(service.price) - 100),
                          )
                        }
                      >
                        ▼
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Deliverables */}
              <div
                className="input-group deliverables-row"
                style={{ marginTop: "1.5rem", display: "block", width: "100%" }}
              >
                <label>Deliverables</label>
                <input
                  type="text"
                  className="dark-input-service"
                  value={service.deliverables}
                  onChange={(e) =>
                    handleInputChange(
                      service.id,
                      "deliverables",
                      e.target.value,
                    )
                  }
                  placeholder="What will clients receive (e.g. 50 edited photos)"
                  style={{ width: "100%" }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="add-service-btn-container">
          <button className="gold-btn-service" onClick={handleAddService}>
            + Add More Services
          </button>
        </div>

        {/* Tips Section */}
        <div className="tips-section-service">
          <div className="tips-header-service">
            <Lightbulb color="#FFD700" size={20} fill="#FFD700" />
            <h4>Tips for creating effective service packages</h4>
          </div>
          <ul className="tips-list-service">
            <li>Be specific about what's included to set clear expectations</li>
            <li>
              Consider offering tiered packages (basic, standard, premium)
            </li>
            <li>Include your turnaround time for deliverables</li>
            <li>Mention any additional fees that might apply</li>
            <li>Highlight your unique selling points</li>
          </ul>
        </div>

        {/* Footer */}
        <div className="service-footer">
          <button
            className="btn-back"
            onClick={handleBack}
            style={{
              background: "#fff",
              color: "#000",
              border: "none",
              padding: "0.8rem 2rem",
              borderRadius: "30px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Back
          </button>
          <button
            className="btn-continue"
            onClick={handleContinue}
            disabled={saving}
            style={{
              background: saving ? "#888" : "#CBB26A",
              color: "#000",
              border: "none",
              padding: "0.8rem 2.5rem",
              borderRadius: "30px",
              fontWeight: "600",
              cursor: saving ? "not-allowed" : "pointer",
            }}
          >
            {saving ? "Saving..." : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PhotographerServices;

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import PortfolioForm from "./PortfolioForm";
import ServicesSection from "./ServicesSection";
import AvailabilitySection from "./AvailabilitySection";
import ExceptionSection from "./ExceptionSection";
import LeadTimeSection from "./LeadTimeSection";
import PortfolioImagesPage from "./PortfolioImagesPage";
import PortfolioVideosPage from "./PortfolioVideosPage";
import { Pencil } from "lucide-react";
import "./PhotographerPortfolio.css";

const PhotographerPortfolio = () => {
  const [photographer, setPhotographer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  const [form, setForm] = useState({
    introduction: "",
    yearsOfExperience: "",
    typeOfWork: "Photographer",
    specialization: [],
    latitude: "",
    longitude: "",
  });

  const [availabilityForm, setAvailabilityForm] = useState({
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
    sunday: [],
  });

  const [leadTimeForm, setLeadTimeForm] = useState({
    workshopDays: false,
    vacationDays: false,
    sameDayBookingAllowed: false,
    advanceNotice: "1 Day",
  });

  const [exceptionForm, setExceptionForm] = useState({
    name: "",
    description: "",
    date: "",
  });

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?._id;
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) return;
    
    // Mock flow handling
    const token = localStorage.getItem("token");
    if (token === "mock-creator-token") {
        const localP = JSON.parse(localStorage.getItem("mock-photographer"));
        if (localP) {
            setPhotographer(localP);
            setForm({
                introduction: localP.introduction || "",
                yearsOfExperience: localP.yearsOfExperience || "",
                typeOfWork: localP.typeOfWork || "Photographer",
                specialization: localP.specialization || [],
                latitude: localP.location?.coordinates?.[1] || "",
                longitude: localP.location?.coordinates?.[0] || "",
            });
            setAvailabilityForm(localP.availability || availabilityForm);
            setLeadTimeForm(localP.bookingLeadTime || leadTimeForm);
        } else {
            setPhotographer(null);
        }
        setLoading(false);
        return;
    }

    const fetchProfile = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/photographers/profile/${userId}`
        );
        const p = res.data.photographer;
        if (p) {
          setPhotographer(p);
          setForm({
            introduction: p.introduction || "",
            yearsOfExperience: p.yearsOfExperience || "",
            typeOfWork: p.typeOfWork || "Photographer",
            specialization: p.specialization || [],
            latitude: p.location?.coordinates?.[1] || "",
            longitude: p.location?.coordinates?.[0] || "",
          });
          setAvailabilityForm(p.availability || availabilityForm);
          setLeadTimeForm(p.bookingLeadTime || leadTimeForm);
        }
      } catch (err) {
        if (err.response?.status === 404) setPhotographer(null);
        else console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSpecialization = (e) => {
    const { value, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      specialization: checked
        ? [...prev.specialization, value]
        : prev.specialization.filter((s) => s !== value),
    }));
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          setForm((prev) => ({
            ...prev,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          })),
        () => alert("Unable to get location. Allow location access.")
      );
    } else alert("Geolocation not supported.");
  };

  const saveProfile = async () => {
    try {
      const payload = { userId, ...form };
      
      const token = localStorage.getItem("token");
      if (token === "mock-creator-token") {
          const updatedP = { ...photographer, ...form, location: { type: 'Point', coordinates: [form.longitude, form.latitude] } };
          localStorage.setItem("mock-photographer", JSON.stringify(updatedP));
          setPhotographer(updatedP);
          setEditMode(false);
          alert("Profile updated successfully! (Mock)");
          return;
      }

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/photographers/profile`,
        payload
      );
      setPhotographer(res.data.photographer);
      setEditMode(false);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to update profile.");
    }
  };

  const specializations = [
    "Portrait",
    "Fashion",
    "Wedding",
    "Event",
    "Commercial Product",
    "Landscape",
    "Documentary",
    "Aerial/Drone",
  ];

  if (loading) return <p className="loading">Loading...</p>;

  return (
    <div className="portfolio-container">
      {photographer && (
        <div className="tabs">
          <button
            className={activeTab === "profile" ? "active" : ""}
            onClick={() => setActiveTab("profile")}
          >
            Profile
          </button>
          <button
            className={activeTab === "images" ? "active" : ""}
            onClick={() => setActiveTab("images")}
          >
            Portfolio Images
          </button>
          <button
            className={activeTab === "videos" ? "active" : ""}
            onClick={() => setActiveTab("videos")}
          >
            Portfolio Videos
          </button>
        </div>
      )}

      {!photographer ? (
        <PortfolioForm
          form={form}
          setForm={setForm}
          userId={userId}
          setPhotographer={setPhotographer}
        />
      ) : (
        <>
          {activeTab === "profile" && (
            <>
              <h1>
                📸 {photographer.introduction}{" "}
                <Pencil onClick={() => setEditMode(!editMode)} size={18} />
              </h1>

              {editMode ? (
                <div className="feature-section">
                  <input
                    type="text"
                    name="introduction"
                    placeholder="Introduction"
                    value={form.introduction}
                    onChange={handleChange}
                  />
                  <input
                    type="number"
                    name="yearsOfExperience"
                    placeholder="Years of Experience"
                    value={form.yearsOfExperience}
                    onChange={handleChange}
                  />
                  <select
                    name="typeOfWork"
                    value={form.typeOfWork}
                    onChange={handleChange}
                  >
                    <option value="Photographer">Photographer</option>
                    <option value="Videographer">Videographer</option>
                    <option value="Both">Both</option>
                  </select>

                  <div className="specialization-section">
                    <label>Specializations:</label>
                    {specializations.map((spec) => (
                      <label key={spec}>
                        <input
                          type="checkbox"
                          value={spec}
                          checked={form.specialization.includes(spec)}
                          onChange={handleSpecialization}
                        />
                        {spec}
                      </label>
                    ))}
                  </div>

                  <div className="location-section">
                    <input
                      type="text"
                      name="latitude"
                      placeholder="Latitude"
                      value={form.latitude}
                      readOnly
                      className="coords-input"
                    />
                    <input
                      type="text"
                      name="longitude"
                      placeholder="Longitude"
                      value={form.longitude}
                      readOnly
                      className="coords-input"
                    />
                    <button type="button" onClick={getCurrentLocation}>
                      Use My Location
                    </button>
                  </div>

                  <div className="feature-buttons">
                    <button onClick={saveProfile}>Save Changes</button>
                    <button onClick={() => setEditMode(false)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="photographer-info">
                    <p>
                      <b>Experience:</b> {photographer.yearsOfExperience} years
                    </p>
                    <p>
                      <b>Type of Work:</b> {photographer.typeOfWork}
                    </p>
                    <p>
                      <b>Specializations:</b>{" "}
                      {photographer.specialization.join(", ")}
                    </p>
                    <p>
                      <b>Location:</b>{" "}
                      {photographer.location?.coordinates
                        ? `${photographer.location.coordinates[1]}, ${photographer.location.coordinates[0]}`
                        : "Not set"}
                    </p>
                  </div>

                  <ServicesSection
                    userId={userId}
                    handleViewServices={() => navigate(`/services/${userId}`)}
                    setPhotographer={setPhotographer}
                  />
                  <AvailabilitySection
                    userId={userId}
                    availabilityForm={availabilityForm}
                    setAvailabilityForm={setAvailabilityForm}
                    setPhotographer={setPhotographer}
                  />
                  <ExceptionSection
                    userId={userId}
                    exceptionForm={exceptionForm}
                    setExceptionForm={setExceptionForm}
                    setPhotographer={setPhotographer}
                  />
                  <LeadTimeSection
                    userId={userId}
                    leadTimeForm={leadTimeForm}
                    setLeadTimeForm={setLeadTimeForm}
                    setPhotographer={setPhotographer}
                  />
                </>
              )}
            </>
          )}

          {activeTab === "images" && (
            <PortfolioImagesPage
              userId={userId}
              setPhotographer={setPhotographer}
            />
          )}

          {activeTab === "videos" && (
            <PortfolioVideosPage
              userId={userId}
              setPhotographer={setPhotographer}
            />
          )}
        </>
      )}
    </div>
  );
};

export default PhotographerPortfolio;

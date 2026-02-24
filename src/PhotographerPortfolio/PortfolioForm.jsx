import axios from "axios";
import "./PortfolioForm.css";

const PortfolioForm = ({ form, setForm, userId, setPhotographer }) => {
  const API_URL = import.meta.env.VITE_API_URL;

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
    if (!navigator.geolocation) {
      alert("Geolocation not supported.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setForm((prev) => ({
          ...prev,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        })),
      () => alert("Unable to get location. Allow location access.")
    );
  };

  const handleCreateOrUpdatePortfolio = async () => {
    try {
      const payload = { userId, ...form };

      const token = localStorage.getItem("token");
      if (token === "mock-creator-token") {
          const newP = { 
             ...payload, 
             _id: "mock-portfolio-id",
             location: { type: 'Point', coordinates: [form.longitude, form.latitude] },
             availability: {},
             bookingLeadTime: {}
          };
          localStorage.setItem("mock-photographer", JSON.stringify(newP));
          setPhotographer(newP);
          // Navigate to media upload page
          navigate("/portfolio/media"); 
          return;
      }

      const res = await axios.post(
        `${API_URL}/api/photographers/profile`,
        payload
      );

      setPhotographer(res.data.photographer);
      
      // Navigate to Media upload page
      navigate("/portfolio/media"); 
    } catch (err) {
      console.error(err);
      alert("Failed to save portfolio.");
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

  return (
    <div className="portfolio-form">
      <h2>Create Your Portfolio</h2>

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

      <select name="typeOfWork" value={form.typeOfWork} onChange={handleChange}>
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
              onChange={handleSpecialization}
              checked={form.specialization.includes(spec)}
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

      <button onClick={handleCreateOrUpdatePortfolio}>
        Create Portfolio
      </button>
    </div>
  );
};

export default PortfolioForm;

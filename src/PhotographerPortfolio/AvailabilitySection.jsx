import React from "react";
import axios from "axios";

const AvailabilitySection = ({ userId, availabilityForm, setAvailabilityForm, setPhotographer }) => {

  const handleAvailability = (day, slot) => {
    setAvailabilityForm((prev) => ({
      ...prev,
      [day]: prev[day].includes(slot)
        ? prev[day].filter((s) => s !== slot)
        : [...prev[day], slot],
    }));
  };

  const handleUpdateAvailability = async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/photographers/availability`,
        { userId, availability: availabilityForm }
      );
      setPhotographer(res.data.photographer);
      alert("Availability updated!");
    } catch (err) {
      console.error(err);
      alert("Failed to update availability.");
    }
  };

  return (
    <div className="feature-section">
      <h4>🗓️ Update Availability</h4>
      {["monday","tuesday","wednesday","thursday","friday","saturday","sunday"].map((day) => (
        <div key={day}>
          <b>{day.charAt(0).toUpperCase() + day.slice(1)}:</b>
          {["Morning","Afternoon","Evening"].map((slot) => (
            <label key={slot}>
              <input
                type="checkbox"
                checked={availabilityForm[day]?.includes(slot)}
                onChange={() => handleAvailability(day, slot)}
              />
              {slot}
            </label>
          ))}
        </div>
      ))}
      <button onClick={handleUpdateAvailability}>Update Availability</button>
    </div>
  );
};

export default AvailabilitySection;

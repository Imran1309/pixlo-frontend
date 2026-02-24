import React from "react";
import axios from "axios";

const LeadTimeSection = ({ userId, leadTimeForm, setLeadTimeForm, setPhotographer }) => {
  const handleUpdateLeadTime = async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/photographers/booking-leadtime`,
        { userId, bookingLeadTime: leadTimeForm }
      );
      setPhotographer(res.data.photographer);
      alert("Booking lead time updated!");
    } catch (err) {
      console.error(err);
      alert("Failed to update lead time.");
    }
  };

  return (
    <div className="feature-section">
      <h4>⏱️ Update Booking Lead Time</h4>
      <label>
        <input
          type="checkbox"
          checked={leadTimeForm.workshopDays}
          onChange={(e) =>
            setLeadTimeForm((prev) => ({ ...prev, workshopDays: e.target.checked }))
          }
        />
        Workshop Days
      </label>
      <label>
        <input
          type="checkbox"
          checked={leadTimeForm.vacationDays}
          onChange={(e) =>
            setLeadTimeForm((prev) => ({ ...prev, vacationDays: e.target.checked }))
          }
        />
        Vacation Days
      </label>
      <label>
        <input
          type="checkbox"
          checked={leadTimeForm.sameDayBookingAllowed}
          onChange={(e) =>
            setLeadTimeForm((prev) => ({ ...prev, sameDayBookingAllowed: e.target.checked }))
          }
        />
        Same Day Booking Allowed
      </label>
      <select
        value={leadTimeForm.advanceNotice}
        onChange={(e) =>
          setLeadTimeForm((prev) => ({ ...prev, advanceNotice: e.target.value }))
        }
      >
        {["1 Day","2 Days","3 Days","1 Week"].map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      <button onClick={handleUpdateLeadTime}>Update Lead Time</button>
    </div>
  );
};

export default LeadTimeSection;

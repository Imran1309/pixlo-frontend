import React from "react";
import axios from "axios";

const ExceptionSection = ({ userId, exceptionForm, setExceptionForm, setPhotographer }) => {
  const handleAddException = async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/photographers/availability/exception`,
        { userId, exception: exceptionForm }
      );
      setPhotographer(res.data.photographer);
      alert("Exception added!");
      setExceptionForm({ name: "", description: "", date: "" });
    } catch (err) {
      console.error(err);
      alert("Failed to add exception.");
    }
  };

  return (
    <div className="feature-section">
      <h4>🚫 Add Availability Exception</h4>
      <input
        type="text"
        placeholder="Name"
        value={exceptionForm.name}
        onChange={(e) =>
          setExceptionForm((prev) => ({ ...prev, name: e.target.value }))
        }
      />
      <input
        type="text"
        placeholder="Description"
        value={exceptionForm.description}
        onChange={(e) =>
          setExceptionForm((prev) => ({ ...prev, description: e.target.value }))
        }
      />
      <input
        type="date"
        value={exceptionForm.date}
        onChange={(e) =>
          setExceptionForm((prev) => ({ ...prev, date: e.target.value }))
        }
      />
      <button onClick={handleAddException}>Add Exception</button>
    </div>
  );
};

export default ExceptionSection;

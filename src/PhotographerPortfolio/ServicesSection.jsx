import React, { useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL; // ⭐ Base URL

const ServicesSection = ({ userId, handleViewServices, setPhotographer }) => {
  const [serviceForm, setServiceForm] = useState({
    serviceName: "",
    description: "",
    durationHours: "",
    priceINR: "",
    deliverables: "",
  });

  const handleAddService = async () => {
    const { serviceName, description, durationHours, priceINR, deliverables } = serviceForm;

    // Basic validation
    if (
      !serviceName.trim() ||
      !description.trim() ||
      !durationHours.trim() ||
      !priceINR.trim() ||
      !deliverables.trim()
    ) {
      alert("⚠️ Please fill in all fields before adding a service.");
      return;
    }

    if (durationHours <= 0 || priceINR <= 0) {
      alert("⚠️ Duration and price must be positive numbers.");
      return;
    }

    try {
      const res = await axios.post(`${API}/api/photographers/service`, {
        userId,
        service: serviceForm,
      });

      setPhotographer(res.data.photographer);
      alert("✅ Service added successfully!");

      // Reset form
      setServiceForm({
        serviceName: "",
        description: "",
        durationHours: "",
        priceINR: "",
        deliverables: "",
      });
    } catch (err) {
      console.error(err);
      alert("❌ Failed to add service. Please try again.");
    }
  };

  return (
    <div className="feature-section">
      <h4>💼 Add Service</h4>

      <input
        type="text"
        placeholder="Service Name"
        value={serviceForm.serviceName}
        onChange={(e) =>
          setServiceForm((prev) => ({ ...prev, serviceName: e.target.value }))
        }
      />

      <input
        type="text"
        placeholder="Description"
        value={serviceForm.description}
        onChange={(e) =>
          setServiceForm((prev) => ({ ...prev, description: e.target.value }))
        }
      />

      <input
        type="number"
        placeholder="Duration (Hours)"
        value={serviceForm.durationHours}
        onChange={(e) =>
          setServiceForm((prev) => ({ ...prev, durationHours: e.target.value }))
        }
      />

      <input
        type="number"
        placeholder="Price (INR)"
        value={serviceForm.priceINR}
        onChange={(e) =>
          setServiceForm((prev) => ({ ...prev, priceINR: e.target.value }))
        }
      />

      <input
        type="text"
        placeholder="Deliverables"
        value={serviceForm.deliverables}
        onChange={(e) =>
          setServiceForm((prev) => ({ ...prev, deliverables: e.target.value }))
        }
      />

      <div className="feature-buttons">
        <button onClick={handleAddService}>Add Service</button>
        <button onClick={handleViewServices}>View My Services</button>
      </div>
    </div>
  );
};

export default ServicesSection;

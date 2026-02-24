import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { FiEdit } from "react-icons/fi";
import "./ViewServices.css";

const API_URL = import.meta.env.VITE_API_URL;

const ViewServices = () => {
  const { id: userId } = useParams();
  const [photographer, setPhotographer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingService, setEditingService] = useState(null);
  const [updatedService, setUpdatedService] = useState({});
  const [toast, setToast] = useState("");

  useEffect(() => {
    const fetchPhotographer = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/photographers/profile/${userId}`);
        setPhotographer(res.data.photographer);
      } catch (err) {
        if (err.response?.status === 404) setPhotographer(null);
        else console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPhotographer();
  }, [userId]);

  const handleEditClick = (service) => {
    setEditingService(service);
    setUpdatedService({
      serviceName: service.serviceName,
      description: service.description,
      durationHours: service.durationHours,
      priceINR: service.priceINR,
      deliverables: service.deliverables,
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedService((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateService = async () => {
    try {
      const res = await axios.put(`${API_URL}/api/photographers/edit-service`, {
        userId,
        serviceId: editingService._id,
        updatedService,
      });

      setPhotographer(res.data.photographer);
      setEditingService(null);
      setToast("Service updated successfully!");
      setTimeout(() => setToast(""), 3000);
    } catch (err) {
      console.error(err);
      setToast("Failed to update service.");
      setTimeout(() => setToast(""), 3000);
    }
  };

  if (loading) return <p className="vs-no-services">Loading...</p>;
  if (!photographer) return <p className="vs-no-services">No services found for this user.</p>;

  return (
    <div className="vs-container">
      <h3 className="vs-heading">Services Offered</h3>

      {toast && <div className="vs-toast">{toast}</div>}

      {photographer.services && photographer.services.length > 0 ? (
        <div className="vs-services-grid">
          {photographer.services.map((service) => (
            <div key={service._id} className="vs-service-card">
              <div className="vs-card-header">
                <h4 className="vs-service-title">{service.serviceName}</h4>
                <FiEdit className="vs-edit-icon" onClick={() => handleEditClick(service)} />
              </div>

              <p className="vs-service-desc">
                <strong>Description:</strong> {service.description}
              </p>
              <p className="vs-service-duration">
                <strong>Duration:</strong> {service.durationHours} hours
              </p>
              <p className="vs-service-price">
                <strong>Price:</strong> ₹{service.priceINR}
              </p>
              <p className="vs-service-deliverables">
                <strong>Deliverables:</strong> {service.deliverables}
              </p>

              {editingService?._id === service._id && (
                <div className="vs-edit-form">
                  <input
                    type="text"
                    name="serviceName"
                    value={updatedService.serviceName}
                    onChange={handleInputChange}
                    placeholder="Service Name"
                  />
                  <input
                    type="text"
                    name="description"
                    value={updatedService.description}
                    onChange={handleInputChange}
                    placeholder="Description"
                  />
                  <input
                    type="number"
                    name="durationHours"
                    value={updatedService.durationHours}
                    onChange={handleInputChange}
                    placeholder="Duration Hours"
                  />
                  <input
                    type="number"
                    name="priceINR"
                    value={updatedService.priceINR}
                    onChange={handleInputChange}
                    placeholder="Price INR"
                  />
                  <input
                    type="text"
                    name="deliverables"
                    value={updatedService.deliverables}
                    onChange={handleInputChange}
                    placeholder="Deliverables"
                  />
                  <button className="vs-update-btn" onClick={handleUpdateService}>
                    Update
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="vs-no-services">No services added yet.</p>
      )}
    </div>
  );
};

export default ViewServices;

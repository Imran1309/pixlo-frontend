import React, { useEffect, useState } from "react";
import axios from "axios";
import "./PhotographerBookings.css";

const PhotographerBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get logged-in user from localStorage
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  })();

  const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    if (!user?._id) {
      alert("Please log in as a photographer to view your bookings.");
      setLoading(false);
      return;
    }

    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem("token"); // auth token if route is protected

        const res = await axios.get(
          `${BASE_URL}/api/bookings/photographer-bookings`,
          {
            params: { userId: user._id }, // send userId, not photographerId
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (res.data.success && Array.isArray(res.data.bookings)) {
          setBookings(res.data.bookings);
        } else {
          setBookings([]);
        }
      } catch (error) {
        console.error("❌ Error fetching bookings:", error.message);
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user?._id, BASE_URL]);

  // Update booking status
  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `${BASE_URL}/api/bookings/${bookingId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setBookings((prev) =>
          prev.map((b) => (b._id === bookingId ? { ...b, status: newStatus } : b))
        );
      }
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Error updating booking status.");
    }
  };

  if (loading) return <p className="loading-text">Loading your bookings...</p>;

  return (
    <div className="bookings-container">
      <h2 className="bookings-title">📸 Your Bookings</h2>

      {bookings.length === 0 ? (
        <p className="no-bookings-text">No bookings found yet.</p>
      ) : (
        <div className="bookings-list">
          {bookings.map((booking) => (
            <div key={booking._id} className="booking-card">
              <h3 className="booking-customer">
                Customer:{" "}
                <span className="customer-name">
                  {booking.customerId?.name || "N/A"}
                </span>
              </h3>

              <p>
                <strong>Date:</strong>{" "}
                {new Date(booking.eventDate).toLocaleDateString()}
              </p>
              <p>
                <strong>Time:</strong> {booking.eventTime}
              </p>
              <p>
                <strong>Location:</strong> {booking.location}
              </p>
              <p>
                <strong>Amount:</strong> ₹{booking.amount}
              </p>

              <p className="booking-status">
                <strong>Status:</strong>{" "}
                <span className={`status-badge ${booking.status}`}>
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </span>
              </p>

              {booking.status === "cancelled" ? (
                <p className="cancelled-note">
                  ❌ This booking was cancelled by the user. Status updates are disabled.
                </p>
              ) : (
                <div className="update-status-section">
                  <label htmlFor={`status-${booking._id}`}>
                    <strong style={{ display: "block", marginBottom: "10px" }}>
                      Update Status:
                    </strong>
                  </label>

                  <select
                    id={`status-${booking._id}`}
                    value={booking.status}
                    onChange={(e) =>
                      handleStatusChange(booking._id, e.target.value)
                    }
                    className="status-select"
                  >
                    <option value="pending">Pending</option>
                    <option value="accepted">Accept</option>
                    <option value="rejected">Reject</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PhotographerBookings;
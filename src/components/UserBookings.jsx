import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaPencilAlt } from "react-icons/fa";
import "./UserBookings.css";

const UserBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user")) || null;
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!user?._id) {
      alert("Please login to view your bookings.");
      setLoading(false);
      return;
    }

    let isMounted = true;

    const fetchBookingsAndReviews = async () => {
      try {
        const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

        // Fetch bookings (with populated photographer and service)
        const bookingsRes = await axios.get(
          `${API}/api/bookings/my-bookings?customerId=${user._id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (isMounted && bookingsRes.data.success) {
          setBookings(bookingsRes.data.bookings);
        }

        // Fetch reviews if available
        try {
          const reviewsRes = await axios.get(
            `${API}/api/reviews?customerId=${user._id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          if (isMounted && reviewsRes.data.success) {
            setReviews(reviewsRes.data.reviews);
          }
        } catch {
          console.warn("Reviews endpoint not available or failed");
        }
      } catch (err) {
        console.error("Error fetching bookings:", err);
        alert("Failed to load bookings. Please try again.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchBookingsAndReviews();

    return () => {
      isMounted = false;
    };
  }, [user?._id, token]);

  // Map reviews by bookingId for fast lookup
  const reviewsMap = useMemo(() => {
    const map = {};
    reviews.forEach((r) => {
      if (r.bookingId?._id) map[r.bookingId._id] = r;
    });
    return map;
  }, [reviews]);

  const hasReview = (bookingId) => !!reviewsMap[bookingId];

  // Cancel booking
  const handleCancelBooking = async (bookingId) => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this booking?"
    );
    if (!confirmCancel) return;

    try {
      const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

      const res = await axios.patch(
        `${API}/api/bookings/${bookingId}/cancel`,
        { userId: user._id, reason: "Cancelled by user" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        alert("Booking cancelled successfully!");
        setBookings((prev) =>
          prev.map((b) =>
            b._id === bookingId ? { ...b, status: "cancelled" } : b
          )
        );
      } else {
        alert(res.data.message || "Failed to cancel booking");
      }
    } catch (err) {
      console.error("Cancel booking error:", err);
      alert(err.response?.data?.message || "Something went wrong");
    }
  };

  if (loading) return <p className="loading-text">Loading your bookings...</p>;

  return (
    <div className="user-bookings-container">
      <h2 className="user-bookings-title">My Bookings</h2>

      {bookings.length === 0 ? (
        <p className="no-bookings-text">No bookings found.</p>
      ) : (
        <div className="user-bookings-list">
          {bookings.map((booking) => (
            <div className="user-booking-card" key={booking._id}>
              <h3 className="booking-photographer">
                Photographer:{" "}
                <span className="highlight">
                  {booking.photographerId?.userId?.name || "N/A"}
                </span>
              </h3>

              {/* <p>
                <strong>Service:</strong>{" "}
                {booking.serviceId?.serviceName || "N/A"}
              </p> */}

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
                <strong>Amount Paid:</strong> ₹{booking.amount}
              </p>

              <p className="status-section">
                <strong>Status:</strong>{" "}
                <span
                  className={`status-badge ${
                    booking.status?.toLowerCase() || "pending"
                  }`}
                >
                  {booking.status
                    ? booking.status[0].toUpperCase() + booking.status.slice(1)
                    : "Pending"}
                </span>
              </p>

              {(booking.status === "cancelled" || booking.status === "rejected") && (
                <p className="refund-msg">
                  <strong>Refund:</strong> Your amount will be refunded.
                </p>
              )}

              {["pending", "accepted"].includes(booking.status?.toLowerCase()) && (
                <button
                  className="cancel-btn"
                  onClick={() => handleCancelBooking(booking._id)}
                >
                  Cancel Booking
                </button>
              )}

              {booking.status === "completed" &&
                (hasReview(booking._id) ? (
                  <button
                    className="edit-review-btn"
                    onClick={() =>
                      navigate(`/rate/${booking._id}`, {
                        state: { photographerId: booking.photographerId?._id },
                      })
                    }
                  >
                    <FaPencilAlt /> Edit Review
                  </button>
                ) : (
                  <button
                    className="rate-btn"
                    onClick={() =>
                      navigate(`/rate/${booking._id}`, {
                        state: { photographerId: booking.photographerId?._id },
                      })
                    }
                  >
                    Rate & Review
                  </button>
                ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserBookings;
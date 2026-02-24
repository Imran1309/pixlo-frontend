import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./RateReview.css";

const RateReview = () => {
  const { bookingId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL;

  const token = localStorage.getItem("token"); // ✅ GET TOKEN
  const customerId = JSON.parse(localStorage.getItem("user"))?._id;
  const photographerId = location.state?.photographerId;

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewId, setReviewId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchReview = async () => {
      try {
        const res = await axios.get(
          `${API_URL}/api/reviews?customerId=${customerId}&bookingId=${bookingId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`, // ✅ ADD TOKEN HERE
            },
          }
        );

        if (res.data.success && res.data.reviews.length > 0) {
          const existingReview = res.data.reviews[0];
          setRating(existingReview.rating);
          setComment(existingReview.comment);
          setReviewId(existingReview._id);
        }
      } catch (err) {
        console.error("Error fetching review:", err);
        toast.error("Failed to fetch review");
      } finally {
        setLoading(false);
      }
    };

    if (customerId && bookingId) {
      fetchReview();
    } else {
      setLoading(false);
    }
  }, [customerId, bookingId, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating || !comment)
      return toast.error("Please provide rating and comment");

    setSubmitting(true);
    const payload = { rating: Number(rating), comment };

    try {
      let res;

      if (reviewId) {
        // UPDATE REVIEW
        res = await axios.put(
          `${API_URL}/api/reviews/${reviewId}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`, // ✅ ADD TOKEN
              "Content-Type": "application/json",
            },
          }
        );

        if (res.data.success) toast.success("Review updated successfully!");
      } else {
        // CREATE NEW REVIEW
        res = await axios.post(
          `${API_URL}/api/reviews`,
          {
            bookingId,
            photographerId,
            customerId,
            ...payload,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`, // ✅ ADD TOKEN
              "Content-Type": "application/json",
            },
          }
        );

        if (res.data.success)
          toast.success("Review submitted successfully!");
      }

      setTimeout(() => navigate("/my-bookings"), 1500);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error submitting review");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!reviewId) return;

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this review?"
    );
    if (!confirmDelete) return;

    setSubmitting(true);
    try {
      const res = await axios.delete(
        `${API_URL}/api/reviews/${reviewId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // ✅ ADD TOKEN
          },
        }
      );

      if (res.data.success) {
        toast.success("Review deleted successfully!");
        setTimeout(() => navigate("/my-bookings"), 1000);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error deleting review");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p>Loading review...</p>;

  return (
    <div className="rate-review-container">
      <h2>{reviewId ? "Edit Your Review" : "Rate & Review Photographer"}</h2>

      <form onSubmit={handleSubmit}>
        <label>Rating (1-5):</label>
        <input
          type="number"
          min="1"
          max="5"
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          required
          disabled={submitting}
        />

        <label>Comment:</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          required
          disabled={submitting}
        ></textarea>

        <div className="buttons">
          <button type="submit" disabled={submitting}>
            {submitting
              ? reviewId
                ? "Updating..."
                : "Submitting..."
              : reviewId
              ? "Update Review"
              : "Submit Review"}
          </button>

          {reviewId && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={submitting}
              style={{
                marginLeft: "10px",
                backgroundColor: "red",
                color: "white",
              }}
            >
              {submitting ? "Deleting..." : "Delete Review"}
            </button>
          )}
        </div>
      </form>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default RateReview;

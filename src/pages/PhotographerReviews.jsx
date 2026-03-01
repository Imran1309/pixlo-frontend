import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { FaStar } from "react-icons/fa";
import "./PhotographerReviews.css";

const PhotographerReviews = () => {
  const { photographerId } = useParams();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL; // 👈 backend URL from .env

        const res = await axios.get(
          `${API_URL}/api/reviews/photographer/${photographerId}`,
        );

        if (res.data.success) {
          setReviews(res.data.reviews);
        }
      } catch (err) {
        console.error("Error fetching reviews:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [photographerId]);

  if (loading) return <p>Loading reviews...</p>;
  if (reviews.length === 0)
    return <p className="no-reviews">No reviews yet.</p>;

  return (
    <div className="reviews-container">
      <h2>Photographer Reviews</h2>
      <div className="reviews-list">
        {reviews.map((review) => (
          <div className="review-card" key={review._id}>
            <div className="review-header">
              <h3>{review.customerId?.name || "Anonymous"}</h3>
              <div className="rating">
                {[...Array(5)].map((_, i) => (
                  <FaStar
                    key={i}
                    color={i < review.rating ? "#ffc107" : "#e4e5e9"}
                  />
                ))}
              </div>
            </div>
            <p className="review-comment">{review.comment}</p>
            <p className="review-date">
              <strong>Event:</strong>{" "}
              {review.bookingId
                ? `${new Date(review.bookingId.eventDate).toLocaleDateString()} at ${review.bookingId.eventTime}`
                : "N/A"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PhotographerReviews;

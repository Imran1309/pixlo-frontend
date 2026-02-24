import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import "./ViewProfile.css";

const ViewProfile = () => {
  const { userId } = useParams();
  const [photographer, setPhotographer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviews, setReviews] = useState([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const navigate = useNavigate();

  // Check if user is logged in and fetch photographer profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/photographers/profile/${userId}`
        );
        setPhotographer(res.data.photographer);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch profile");
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchProfile();
  }, [userId, navigate]);

  useEffect(() => {
    if (photographer) {
      axios.get(`${import.meta.env.VITE_API_URL}/api/photographers/${photographer._id}/reviews`)
        .then(res => setReviews(res.data.reviews || []))
        .catch(err => console.error("Error fetching reviews:", err));
    }
  }, [photographer]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) {
      alert("Please login to submit a review.");
      return;
    }
    
    setIsSubmittingReview(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/photographers/${photographer._id}/reviews`, {
        customerId: storedUser._id,
        rating: reviewRating,
        comment: reviewComment
      });
      if (res.data.success) {
        setReviews([res.data.review, ...reviews]);
        setReviewComment("");
        setReviewRating(5);
        alert("Review submitted successfully!");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit review.");
      console.error(err);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleBookNow = (service) => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login"); // redirect if not logged in
      return;
    }

    navigate(`/book/${userId}/${service._id}`, {
      state: { service, photographer: photographer },
    });
  };

  const handleMessageClick = () => {
    const contactMethod = photographer.userId?.phone;
    if (contactMethod) {
       // Remove non-numeric characters for reliable WhatsApp routing, default to standard INR country code format if local
       let cleanPhone = contactMethod.replace(/\D/g, '');
       if (cleanPhone.length === 10) { cleanPhone = '91' + cleanPhone; }
       const message = encodeURIComponent(`Hi ${name}, I found your profile on Pixlo and I'm interested in working with you!`);
       window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
    } else if (photographer.userId?.email) {
       const subject = encodeURIComponent("Inquiry from Pixlo");
       const body = encodeURIComponent(`Hi ${name},\n\nI found your profile on Pixlo and I'm interested in booking a shoot with you.\n\nBest regards,`);
       window.open(`mailto:${photographer.userId.email}?subject=${subject}&body=${body}`);
    } else {
       alert("Contact information currently unavailable for this creator.");
    }
  };

  const handleViewReviews = () => {
    navigate(`/photographer/${photographer._id}/reviews`);
  };

  if (loading) return <p className="vp-loading">Loading profile...</p>;
  if (error) return <p className="vp-error">{error}</p>;
  if (!photographer) return <p className="vp-error">No photographer found.</p>;

  const defaultProfilePic = "https://via.placeholder.com/150";
  const profilePic = photographer.userId?.profilePic || defaultProfilePic;
  const name = photographer.userId?.name || "Photographer Name";
  const intro = photographer.introduction || photographer.typeOfWork || "Professional Photographer";
  
  return (
    <div className="vp-page-container">
      {/* Top Header Section */}
      <div className="vp-top-header">
        <img src={profilePic} alt={name} className="vp-profile-img" />
        <div className="vp-header-details">
          <h1 className="vp-title">{name}</h1>
          <p className="vp-subtitle">{intro}</p>
          <div className="vp-rating-badge">
            <span className="stars">★★★★★</span>
            <span className="rating-score">5.00</span>
            <span className="review-count"> (100 reviews)</span>
          </div>
          <div className="vp-header-buttons">
            <button className="vp-btn vp-btn-primary" onClick={() => document.getElementById('packages').scrollIntoView({behavior: 'smooth'})}>Book now</button>
            <button className="vp-btn vp-btn-outline" onClick={handleMessageClick}>Message</button>
          </div>
        </div>
      </div>

      {/* Portfolio Gallery */}
      <div className="vp-section">
        <div className="vp-section-header-flex">
          <h2 className="vp-section-title">Portfolio gallery</h2>
          <div className="vp-filter-chips">
            <span className="vp-chip active">Events</span>
            <span className="vp-chip">Kids</span>
            <span className="vp-chip">Couple</span>
          </div>
        </div>
        <div className="vp-gallery-grid">
          {photographer.portfolioImages?.length > 0 ? (
            photographer.portfolioImages.slice(0, 3).map((img, idx) => (
              <div key={idx} className="vp-gallery-item">
                <img src={img} alt={`Portfolio ${idx}`} />
              </div>
            ))
          ) : (
            <>
               <div className="vp-gallery-item"><img src="https://images.unsplash.com/photo-1542038784456-1ea8e935640e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60" alt="placeholder" /></div>
               <div className="vp-gallery-item"><img src="https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60" alt="placeholder" /></div>
               <div className="vp-gallery-item"><img src="https://images.unsplash.com/photo-1520854221256-17451cc331bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60" alt="placeholder" /></div>
            </>
          )}
        </div>
      </div>

      {/* About the Creator */}
      <div className="vp-about-box">
        <h2 className="vp-about-title">About the creator</h2>
        <p className="vp-about-desc">
          {photographer.introduction || `${name} is a passionate lifestyle and fine-art wedding photographer known for capturing raw emotions and natural moments with an unscripted touch. With an eye for storytelling and a warm, people-first approach, ${name} turns everyday scenes into timeless memories. From cozy couple shoots to vibrant family portraits, the work beautifully blends elegance with authenticity—perfect for those looking to freeze their most heartfelt moments forever.`}
        </p>
        
        <h3 className="vp-equip-title">Equipment</h3>
        <div className="vp-equip-list">
          <p><strong>Camera Body:</strong></p>
          <ul>
            <li>Sony A7 IV - for crisp image quality and fast autofocus in dynamic environments</li>
          </ul>
          <p><strong>Lenses:</strong></p>
          <ul>
            <li>50mm f/1.2 - perfect for creamy portraits with bokeh</li>
            <li>24-70mm f/2.8 - versatile for candid shots and wide frames</li>
            <li>85mm f/1.4 - ideal for intimate close-ups</li>
          </ul>
          <p><strong>Lighting Gear:</strong></p>
          <ul>
            <li>Godox AD200Pro/Pro100 - compact yet powerful for on-location shoots</li>
            <li>Reflectors & diffusers - to control natural light beautifully</li>
          </ul>
        </div>
      </div>

      {/* Packages Section */}
      <div className="vp-section" id="packages">
        <h2 className="vp-centered-title">Select the Best Photography Package for<br/>Your Perfect Shoot</h2>
        <div className="vp-packages-flex">
          {photographer.services?.length > 0 ? (
            photographer.services.map((s, idx) => (
              <div key={s._id} className="vp-package-card">
                <div className="pkg-header">
                  <span className="pkg-name">{s.serviceName || "Package"}</span>
                  <div className="pkg-price">₹{s.priceINR || s.price}<span>/session</span></div>
                  <div className="pkg-duration">Up to {s.durationHours || 2} hours of shoot</div>
                </div>
                <ul className="pkg-features">
                  <li><span className="chk">✔</span> 1 location</li>
                  <li><span className="chk">✔</span> 50 edited images</li>
                  <li><span className="chk">✔</span> Online gallery</li>
                  <li><span className="chk">✔</span> Print rights</li>
                  <li><span className="chk">✔</span> 1 Outfit Change</li>
                  {s.deliverables && <li><span className="chk">✔</span> {s.deliverables}</li>}
                </ul>
                <button className="vp-btn-full" onClick={() => handleBookNow(s)}>Book Now</button>
              </div>
            ))
          ) : (
             <>
              <div className="vp-package-card">
                <div className="pkg-header">
                  <span className="pkg-name">Premium</span>
                  <div className="pkg-price">₹10000<span>/session</span></div>
                  <div className="pkg-duration">Up to 2 hours of shoot</div>
                </div>
                <ul className="pkg-features">
                  <li><span className="chk">✔</span> 1 location</li>
                  <li><span className="chk">✔</span> 50 edited images</li>
                  <li><span className="chk">✔</span> Online gallery</li>
                  <li><span className="chk">✔</span> Print rights</li>
                  <li><span className="chk">✔</span> 1 Outfit Change</li>
                </ul>
                <button className="vp-btn-full" onClick={() => handleBookNow({})}>Book Now</button>
              </div>
              <div className="vp-package-card highlighted">
                <div className="pkg-header">
                  <span className="pkg-name">Gold Pro</span>
                  <div className="pkg-price">₹20000<span>/session</span></div>
                  <div className="pkg-duration">Up to 4 hours of shoot</div>
                </div>
                <ul className="pkg-features">
                  <li><span className="chk">✔</span> 2 locations</li>
                  <li><span className="chk">✔</span> 100 edited images</li>
                  <li><span className="chk">✔</span> Online gallery</li>
                  <li><span className="chk">✔</span> Print rights</li>
                  <li><span className="chk">✔</span> 2 Outfit Changes</li>
                </ul>
                <button className="vp-btn-full" onClick={() => handleBookNow({})}>Book Now</button>
              </div>
              <div className="vp-package-card">
                <div className="pkg-header">
                  <span className="pkg-name">Platinum Plus</span>
                  <div className="pkg-price">₹35000<span>/session</span></div>
                  <div className="pkg-duration">Full day shoot (8 hours)</div>
                </div>
                <ul className="pkg-features">
                  <li><span className="chk">✔</span> Multiple locations</li>
                  <li><span className="chk">✔</span> 250 edited images</li>
                  <li><span className="chk">✔</span> Online gallery & USB</li>
                  <li><span className="chk">✔</span> Print rights & Album</li>
                  <li><span className="chk">✔</span> Infinite Outfit Changes</li>
                </ul>
                <button className="vp-btn-full" onClick={() => handleBookNow({})}>Book Now</button>
              </div>
             </>
          )}
        </div>
      </div>

      {/* Ratings & Reviews Section */}
      <div className="vp-section">
        <h2 className="vp-section-title">Ratings & Reviews</h2>
        
        <div className="vp-reviews-container">
          {/* Left Side: Summary */}
          <div className="vp-reviews-summary">
            <h3>Ratings & Reviews (235)</h3>
            <p className="summary-subtitle">Summary</p>
            
            <div className="rating-bars">
               <div className="rating-bar-row">
                 <div className="bar-bg"><div className="bar-fill" style={{width: '90%'}}></div></div>
                 <span className="star-num">4.5★</span>
               </div>
               <div className="rating-bar-row">
                 <div className="bar-bg"><div className="bar-fill" style={{width: '70%'}}></div></div>
                 <span className="star-num"></span>
               </div>
               <div className="rating-bar-row">
                 <div className="bar-bg"><div className="bar-fill" style={{width: '30%'}}></div></div>
                 <span className="star-num"></span>
               </div>
               <div className="rating-bar-row">
                 <div className="bar-bg"><div className="bar-fill" style={{width: '10%'}}></div></div>
                 <span className="star-num"></span>
               </div>
               <div className="rating-bar-row">
                 <div className="bar-bg"><div className="bar-fill" style={{width: '5%'}}></div></div>
                 <span className="star-num"></span>
               </div>
            </div>
          </div>
          
          {/* Right Side: Reviews List & Form */}
          <div className="vp-reviews-list">
             <div className="vp-write-review">
                <h4 style={{marginBottom: "1rem", fontSize: "1.1rem"}}>Write a Review</h4>
                <form onSubmit={handleSubmitReview} className="vp-review-form">
                   <div className="vp-review-rating-select">
                      <label>Rating: </label>
                      <select value={reviewRating} onChange={(e) => setReviewRating(Number(e.target.value))}>
                         <option value="5">5 ★★★★★</option>
                         <option value="4">4 ★★★★</option>
                         <option value="3">3 ★★★</option>
                         <option value="2">2 ★★</option>
                         <option value="1">1 ★</option>
                      </select>
                   </div>
                   <textarea 
                     className="vp-review-textarea" 
                     placeholder="Share your experience with this creator..."
                     value={reviewComment}
                     onChange={(e) => setReviewComment(e.target.value)}
                     required
                     rows={3}
                   ></textarea>
                   <button type="submit" className="vp-btn vp-btn-primary" disabled={isSubmittingReview} style={{marginTop: "1rem"}}>
                     {isSubmittingReview ? "Submitting..." : "Submit Review"}
                   </button>
                </form>
             </div>
             
             {/* Divider */}
             <div style={{width: '100%', height: '1px', backgroundColor: '#333', margin: '2rem 0'}}></div>

             {reviews.length > 0 ? reviews.map((rev) => (
                <div key={rev._id} className="review-item">
                  <div className="rev-header">
                    <img src={rev.customerId?.profilePic || "https://via.placeholder.com/40"} alt="user" className="rev-avatar" />
                    <div className="rev-user-info">
                       <span className="rev-name">{rev.customerId?.name || "User"}</span>
                       <span className="rev-stars">{'★'.repeat(rev.rating)}</span>
                    </div>
                    <span className="rev-time">{new Date(rev.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="rev-text">{rev.comment}</p>
                  <div className="rev-footer-stats">
                     <span>Helpful</span>
                  </div>
                </div>
             )) : (
                 <p style={{color: '#888', marginTop: '1rem'}}>No reviews yet. Be the first to review!</p>
             )}
             
             <div className="vp-view-all-reviews">
               <button className="vp-btn vp-btn-outline" onClick={handleViewReviews}>View all reviews</button>
             </div>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default ViewProfile;

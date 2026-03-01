import React, { useState, useEffect } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./BookingPage.css";

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_Qi1InUYyVMLZdY";
const OPENCAGE_API_KEY = import.meta.env.VITE_OPENCAGE_API_KEY;

const BookingPage = () => {
  const { photographerId, serviceId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const service = location.state?.service;
  const photographer = location.state?.photographer;

  const user = JSON.parse(localStorage.getItem("user"));
  const customerId = user?._id;

  const [step, setStep] = useState(1);

  const [personalInfo, setPersonalInfo] = useState({
    firstName: user?.name?.split(" ")[0] || "",
    lastName: user?.name?.split(" ").slice(1).join(" ") || "",
    mobileNumber: user?.phone || "",
    email: user?.email || "",
  });

  const [formData, setFormData] = useState({
    eventDate: "",
    eventTime: "",
    location: "",
  });

  const [loading, setLoading] = useState(false);
  const [city, setCity] = useState("");

  const [timeHour, setTimeHour] = useState("10");
  const [timeMinute, setTimeMinute] = useState("00");
  const [timeAmPm, setTimeAmPm] = useState("AM");

  const [currentDisplayDate, setCurrentDisplayDate] = useState(new Date());

  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [confirmedBookingDetails, setConfirmedBookingDetails] = useState(null);

  const amount = service?.priceINR || service?.price || 2000;

  // Load Razorpay script dynamically
  useEffect(() => {
    if (!document.getElementById("razorpay-script")) {
      const script = document.createElement("script");
      script.id = "razorpay-script";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  React.useEffect(() => {
    let hr = parseInt(timeHour, 10);
    if (timeAmPm === "PM" && hr !== 12) hr += 12;
    if (timeAmPm === "AM" && hr === 12) hr = 0;
    const hrStr = String(hr).padStart(2, '0');
    setFormData(prev => ({ ...prev, eventTime: `${hrStr}:${timeMinute}` }));
  }, [timeHour, timeMinute, timeAmPm]);

  React.useEffect(() => {
    if (formData.eventDate) {
      setCurrentDisplayDate(new Date(formData.eventDate));
    }
  }, [formData.eventDate]);

  const handleDayClick = (day) => {
    const newDate = new Date(currentDisplayDate.getFullYear(), currentDisplayDate.getMonth(), day);
    const yyyy = newDate.getFullYear();
    const mm = String(newDate.getMonth() + 1).padStart(2, '0');
    const dd = String(newDate.getDate()).padStart(2, '0');
    setFormData(prev => ({ ...prev, eventDate: `${yyyy}-${mm}-${dd}` }));
  };

  const handleCalendarMonthScroll = (offset) => {
    setCurrentDisplayDate(prev => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + offset);
      return d;
    });
  };

  const year = currentDisplayDate.getFullYear();
  const month = currentDisplayDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push({ day: daysInPrevMonth - firstDay + i + 1, current: false });
  }
  const selectedDateStr = formData.eventDate || "";
  for (let i = 1; i <= daysInMonth; i++) {
    const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    calendarDays.push({ day: i, current: true, selected: dStr === selectedDateStr });
  }
  const remaining = 42 - calendarDays.length;
  for (let i = 1; i <= remaining; i++) {
    calendarDays.push({ day: i, current: false });
  }

  const API_URL = import.meta.env.VITE_API_URL; // ✅ backend url from env

  const handlePersonalInfoChange = (e) => {
    setPersonalInfo({ ...personalInfo, [e.target.name]: e.target.value });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const nextStep = () => {
    if (step < 3) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await axios.get(
            `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${OPENCAGE_API_KEY}`
          );
          if (res.data.results && res.data.results.length > 0) {
            const components = res.data.results[0].components;
            const cityName =
              components.city ||
              components.town ||
              components.village ||
              components.state ||
              "";
            setCity(cityName);
            setFormData((prev) => ({ ...prev, location: cityName }));
          } else {
            alert("Unable to fetch address. Please try again.");
          }
        } catch (err) {
          console.error("Geocoding error:", err);
          alert("Unable to fetch address. Please try again.");
        }
      },
      (err) => {
        console.error(err);
        alert("Unable to access location. Please enable GPS.");
      }
    );
  };

  const handleRazorpayPayment = (order, booking, preferQR = false) => {
    if (!order || !window.Razorpay) {
      alert("Payment gateway not loaded. Please refresh and try again.");
      setLoading(false);
      return;
    }

    const options = {
      key: RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency || "INR",
      name: "Pixlo",
      description: `Booking for ${service?.serviceName}`,
      order_id: order.id,
      handler: async function (response) {
        try {
          setLoading(true);
          const verifyRes = await axios.post(
            `${API_URL}/api/bookings/verify-payment`,
            {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingId: booking._id,
            }
          );

          if (verifyRes.data.success) {
            setConfirmedBookingDetails(verifyRes.data.booking);
            setPaymentSuccess(true);
            setLoading(false);
          } else {
            alert("Payment verification failed. Please contact support.");
            setLoading(false);
          }
        } catch (err) {
          console.error("Payment verification error:", err);
          alert("Payment verification failed. Please contact support.");
          setLoading(false);
        }
      },
      prefill: {
        name: `${personalInfo.firstName} ${personalInfo.lastName}`,
        email: personalInfo.email,
        contact: personalInfo.mobileNumber || "9999999999",
      },
      theme: {
        color: "#c29d5b",
      },
      modal: {
        ondismiss: function () {
          setLoading(false);
          alert("Payment was cancelled. Your booking is pending payment.");
        },
      },
    };

    if (preferQR) {
      options.config = {
        display: {
          blocks: {
            upi: {
              name: "Pay with QR Code",
              instruments: [
                { method: "upi" }
              ]
            }
          },
          sequence: ["block.upi"],
          preferences: { show_default_blocks: true }
        }
      };
    }

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const handleBooking = async () => {
    setLoading(true);

    if (!customerId) {
      alert("Please log in before booking.");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post(`${API_URL}/api/bookings`, {
        // ✅ updated
        customerId,
        photographerId,
        serviceId,
        eventDate: formData.eventDate,
        eventTime: formData.eventTime,
        durationHours: service?.durationHours,
        location: formData.location,
        amount: service?.priceINR,
      });

      if (res.data.success) {
        const { order, booking } = res.data;

        // Open Razorpay — booking only confirmed after payment verification
        if (order) {
          handleRazorpayPayment(order, booking, amount <= 100000);
        } else {
          alert("Failed to create payment order.");
          setLoading(false);
        }
      } else {
        alert(res.data.message || "Booking failed.");
        setLoading(false);
      }
    } catch (err) {
      console.error("Booking error:", err);
      alert("Something went wrong while creating booking.");
      setLoading(false);
    }
  };

  if (paymentSuccess) {
    return (
      <div className="payment-success-wrapper fade-in">
        <div className="payment-success-content">
          <div className="success-icon-container">
            <div className="success-circle">
              <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check"><path d="M20 6 9 17l-5-5" /></svg>
            </div>
            <div className="confetti-dot dot-1"></div>
            <div className="confetti-dot dot-2"></div>
            <div className="confetti-dot dot-3"></div>
            <div className="confetti-dot dot-4"></div>
            <div className="confetti-dot dot-5"></div>
            <div className="confetti-dot dot-6"></div>
          </div>
          <h2 className="success-text">Booking Confirmed!</h2>
          <p style={{ color: "#aaa", margin: "0.5rem 0 1.5rem", fontSize: "0.95rem" }}>
            Your payment was successful and the booking is confirmed.
          </p>

          {confirmedBookingDetails && (
            <div style={{ background: "#222", padding: "1.5rem", borderRadius: "8px", textAlign: "left", marginBottom: "1.5rem", width: "100%", maxWidth: "300px", margin: "0 auto 1.5rem auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <span style={{ color: "#888" }}>Booking ID:</span>
                <span style={{ color: "#fff", fontWeight: "bold" }}>#{confirmedBookingDetails._id.substring(0, 8)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <span style={{ color: "#888" }}>Amount Paid:</span>
                <span style={{ color: "#CBB26A", fontWeight: "bold" }}>₹{confirmedBookingDetails.amount}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <span style={{ color: "#888" }}>Date:</span>
                <span style={{ color: "#fff" }}>{new Date(confirmedBookingDetails.eventDate).toLocaleDateString()}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#888" }}>Time:</span>
                <span style={{ color: "#fff" }}>{confirmedBookingDetails.eventTime}</span>
              </div>
            </div>
          )}

        </div>
        <button className="return-home-btn" onClick={() => navigate("/my-bookings")}>VIEW MY BOOKINGS</button>
        <button style={{ background: "transparent", color: "#888", border: "none", marginTop: "0.75rem", cursor: "pointer", fontSize: "0.9rem" }} onClick={() => navigate("/")}>Return to Home</button>
      </div>
    );
  }

  return (
    <div className="bk-page-wrapper">
      <div className="bk-container">


        {/* Stepper Header */}
        <div className="bk-stepper">
          <div className={`bk-step ${step >= 1 ? "active" : ""}`}>
            <span className="bk-step-num">1</span>
            <span className="bk-step-text">Booking Details</span>
          </div>
          <div className="bk-step-line"></div>
          <div className={`bk-step ${step >= 2 ? "active" : ""}`}>
            <span className="bk-step-num">2</span>
            <span className="bk-step-text">Select Date & Time</span>
          </div>
          <div className="bk-step-line"></div>
          <div className={`bk-step ${step >= 3 ? "active" : ""}`}>
            <span className="bk-step-num">3</span>
            <span className="bk-step-text">Select Payment</span>
          </div>
        </div>

        <div className="bk-content">
          {step === 1 && (
            <div className="bk-step-1 fade-in">
              <h2 className="bk-section-title">Personal Information</h2>
              <div className="bk-form-grid">
                <div className="bk-input-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={personalInfo.firstName}
                    onChange={handlePersonalInfoChange}
                  />
                </div>
                <div className="bk-input-group">
                  <label>Last name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={personalInfo.lastName}
                    onChange={handlePersonalInfoChange}
                  />
                </div>
                <div className="bk-input-group">
                  <label>Mobile Number</label>
                  <input
                    type="text"
                    name="mobileNumber"
                    value={personalInfo.mobileNumber}
                    onChange={handlePersonalInfoChange}
                  />
                </div>
                <div className="bk-input-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={personalInfo.email}
                    onChange={handlePersonalInfoChange}
                  />
                </div>
              </div>

              <h2 className="bk-section-title title-margin-top">
                Selected package
              </h2>
              <div className="bk-package-card">
                <div className="bk-package-info">
                  <h3>{service?.serviceName || "Mini Session"}</h3>
                  <div className="price-tag">
                    ₹{service?.priceINR || service?.price || "2000"}/session
                  </div>
                  <p className="subtitle">
                    {service?.description || "Perfect for quick lifestyle moments"}
                  </p>
                  <ul className="package-features">
                    <li>
                      <span className="check-icon">✓</span>{" "}
                      {service?.durationHours || 1}-hr shoot
                    </li>
                    <li>
                      <span className="check-icon">✓</span> 1 location
                    </li>
                    <li>
                      <span className="check-icon">✓</span> 15 edited photos
                    </li>
                    <li>
                      <span className="check-icon">✓</span> No outfit change
                    </li>
                    <li>
                      <span className="check-icon">✓</span> chat support
                    </li>
                    {service?.deliverables && (
                      <li>
                        <span className="check-icon">✓</span>{" "}
                        {service.deliverables}
                      </li>
                    )}
                  </ul>
                </div>
                <div className="bk-package-image">
                  <img
                    src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                    alt="Camera"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="bk-step-2 fade-in relative-container">
              <div className="step2-layout">
                {/* Left Side: Calendar */}
                <div className="step2-left">
                  <h2 className="bk-section-title">Schedule Date & Time</h2>
                  <div className="custom-calendar-card">
                    <div className="cal-bg-curve"></div>
                    <div className="cal-content">
                      <div className="cal-left-panel">
                        <div className="cal-year">{currentDisplayDate.getFullYear()}</div>
                        <div className="cal-months">
                          {[-2, -1, 0, 1, 2].map((offset) => {
                            const mIdx = (currentDisplayDate.getMonth() + offset + 12) % 12;
                            return (
                              <div
                                key={offset}
                                className={`cal-month ${offset === 0 ? "active" : ""}`}
                                onClick={() => handleCalendarMonthScroll(offset)}
                              >
                                {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][mIdx]}
                              </div>
                            );
                          })}
                        </div>
                        <div className="cal-title-bottom">Calender {currentDisplayDate.getFullYear()}</div>
                      </div>
                      <div className="cal-right-panel">
                        <div className="cal-date-header">
                          {formData.eventDate
                            ? new Date(formData.eventDate).toLocaleDateString("en-US", {
                              month: "short",
                              day: "2-digit",
                              weekday: "long",
                            }).replace(" ", " ")
                            : "Select a date"}
                        </div>
                        <div className="cal-weekdays">
                          <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
                        </div>
                        <div className="cal-days-grid">
                          {calendarDays.map((d, idx) => (
                            <button
                              key={idx}
                              type="button"
                              className={`cal-day ${d.current ? "current-month" : "other-month"} ${d.selected ? "selected-day" : ""}`}
                              onClick={() => d.current && handleDayClick(d.day)}
                              disabled={!d.current}
                            >
                              {d.day}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side: Inputs & Package */}
                <div className="step2-right">
                  <div className="bk-input-group text-white-label time-wrapper">
                    <label>Time</label>
                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', backgroundColor: '#fff', borderRadius: '8px', padding: '0.75rem 1rem' }}>
                      <select
                        value={timeHour}
                        onChange={(e) => setTimeHour(e.target.value)}
                        style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '1rem', color: '#000', cursor: 'pointer', appearance: 'none', fontWeight: '500' }}
                      >
                        {Array.from({ length: 12 }, (_, i) => {
                          const h = String(i + 1).padStart(2, '0');
                          return <option key={h} value={h}>{h}</option>;
                        })}
                      </select>
                      <span style={{ color: '#000', fontWeight: 'bold' }}>:</span>
                      <select
                        value={timeMinute}
                        onChange={(e) => setTimeMinute(e.target.value)}
                        style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '1rem', color: '#000', cursor: 'pointer', appearance: 'none', fontWeight: '500' }}
                      >
                        {["00", "15", "30", "45"].map(m => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                      <select
                        value={timeAmPm}
                        onChange={(e) => setTimeAmPm(e.target.value)}
                        style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '1rem', color: '#000', marginLeft: 'auto', cursor: 'pointer', appearance: 'none', fontWeight: '600' }}
                      >
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                      </select>
                    </div>
                  </div>

                  <div className="bk-input-group text-white-label time-wrapper" style={{ marginTop: '1.5rem', marginBottom: '2.5rem' }}>
                    <label>Location</label>
                    <div className="location-input-wrapper">
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="Enter location"
                      />
                      <button type="button" onClick={handleUseMyLocation}>
                        Use My Location
                      </button>
                    </div>
                    {city && (
                      <p className="city-info" style={{ marginTop: "10px", color: "#ccc", fontSize: "0.85rem" }}>
                        Detected City: {city}
                      </p>
                    )}
                  </div>

                  {/* Reused Package Card from Step 1 */}
                  <div className="bk-package-card step2-pkg-card">
                    <div className="bk-package-info">
                      <h3>{service?.serviceName || "Mini Session"}</h3>
                      <div className="price-tag">
                        ₹{service?.priceINR || service?.price || "2000"}/session
                      </div>
                      <p className="subtitle">
                        {service?.description || "Perfect for quick lifestyle moments"}
                      </p>
                      <ul className="package-features">
                        <li>
                          <span className="check-icon">✓</span>{" "}
                          {service?.durationHours || 1}-hr shoot
                        </li>
                        <li>
                          <span className="check-icon">✓</span> 1 location
                        </li>
                        <li>
                          <span className="check-icon">✓</span> 15 edited photos
                        </li>
                        <li>
                          <span className="check-icon">✓</span> No outfit change
                        </li>
                        <li>
                          <span className="check-icon">✓</span> chat support
                        </li>
                        {service?.deliverables && (
                          <li>
                            <span className="check-icon">✓</span>{" "}
                            {service.deliverables}
                          </li>
                        )}
                      </ul>
                    </div>
                    <div className="bk-package-image step2-pkg-img">
                      <img
                        src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                        alt="Camera"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="bk-step-3 fade-in relative-container">
              <div className="step3-layout">
                {/* Left Side: Payment Form */}
                <div className="step3-left">
                  <h2 className="step3-title">Complete Payment</h2>
                  <div className="step3-divider"></div>

                  <div className="payment-instructions">
                    <p style={{ color: "#eee", fontSize: "1rem", lineHeight: "1.6", marginBottom: "1.5rem" }}>
                      You will be redirected to our secure <strong>Razorpay</strong> checkout gateway.
                    </p>
                    <ul style={{ color: "#aaa", fontSize: "0.9rem", lineHeight: "1.8", marginBottom: "2rem", listStyleType: "none", paddingLeft: "10px" }}>
                      <li><span className="check-icon" style={{ color: "#CBB26A", marginRight: "10px" }}>✓</span> Pay instantly using UPI, PhonePe, or GPay {amount <= 100000 && "(QR code available)"}</li>
                      <li><span className="check-icon" style={{ color: "#CBB26A", marginRight: "10px" }}>✓</span> All major Credit and Debit Cards accepted</li>
                      <li><span className="check-icon" style={{ color: "#CBB26A", marginRight: "10px" }}>✓</span> Supports Netbanking across all top Indian banks</li>
                    </ul>
                  </div>

                  <button
                    className="step3-pay-btn"
                    onClick={handleBooking}
                    disabled={loading}
                    style={{ fontSize: "1.1rem", padding: "1rem", marginTop: "1rem" }}
                  >
                    {loading ? "Processing Payment..." : `Proceed to Pay ₹${amount}`}
                  </button>

                  <p className="step3-disclaimer" style={{ marginTop: "2rem" }}>
                    Your personal data will be used to process your order, support your experience throughout this website, and for other purposes described in our privacy policy.
                  </p>
                </div>

                {/* Right Side: Order Summary */}
                <div className="step3-right">
                  <h2 className="step3-title">Order Summary</h2>
                  <div className="step3-divider"></div>

                  <div className="order-photographer-info">
                    <img
                      src={photographer?.userId?.profilePic || "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80"}
                      alt="Photographer"
                      className="order-photo"
                    />
                    <div className="order-details-text">
                      <h4>{photographer?.userId?.name || photographer?.name || "Creator"}</h4>
                      <p>{photographer?.introduction || "Candid & baby shoot specialist"}</p>
                    </div>
                    <div className="order-price-top">
                      ₹{service?.priceINR || service?.price || 2000}
                    </div>
                  </div>

                  <div className="step3-divider"></div>

                  <div className="discount-row">
                    <input type="text" className="step3-input flex-input" placeholder="Gift or discount code" />
                    <button className="apply-btn">Apply</button>
                  </div>

                  <div className="step3-divider"></div>

                  <div className="summary-row">
                    <span>Subtotal</span>
                    <span>₹{service?.priceINR || service?.price || 2000}</span>
                  </div>
                  <div className="summary-row">
                    <span>Shipping</span>
                    <span>₹0</span>
                  </div>

                  <div className="step3-divider"></div>

                  <div className="summary-row total-row">
                    <div className="total-label-col">
                      <span>Total</span>
                      <small>Including ₹0 in taxes</small>
                    </div>
                    <span className="total-amount">₹{service?.priceINR || service?.price || 2000}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Actions */}
          {step < 3 && (
            <div className="bk-bottom-actions">
              {step > 1 && (
                <button className="bk-btn-secondary" onClick={prevStep}>
                  Back
                </button>
              )}
              <div className="spacer"></div>
              <button className="bk-btn-primary" onClick={nextStep}>
                Continue
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingPage;

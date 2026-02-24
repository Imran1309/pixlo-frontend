import React, { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import {
  Search,
  MoveRight,
  BadgeCheck,
  Camera,
  MessagesSquare,
  SquareUser,
  CalendarDays,
  MapPin,
  SquareArrowUpRight,
  User,
  LogOut,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
} from "lucide-react";


// ... existing imports ... (Lines 20-302 remain unchanged roughly, but I need to target the end of file for the footer replacement)
// I can't do non-contiguous edits easily with replace_file_content if I want to update imports AND footer at the bottom.
// I will split this into two calls or use multi_replace.
// I'll use multi_replace.



import slideimage1 from "./assets/slideimage1.jpg";
import slideimage2 from "./assets/slideimage2.jpg";
import slideimage3 from "./assets/slideimage3.jpg";
import newSpiral from "./assets/new-spiral.png";
import "./Home.css";

const Home = () => {
  const [user, setUser] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const [featuredCreators, setFeaturedCreators] = useState([
      {
        name: "Ravi Lenswala",
        image: "https://images.unsplash.com/photo-1554048612-387768052bf7?auto=format&fit=crop&q=80&w=300&h=300",
        desc: "Captures candid wedding moments with a cinematic touch. Clients love his natural storytelling style and warm color grading."
      },
      {
         name: "Meera Clicks",
         image: "https://images.unsplash.com/photo-1542596594-649edbc13630?auto=format&fit=crop&q=80&w=300&h=300",
         desc: "Expert in baby and maternity shoots with a dreamy tone. Her sessions are perfectly timed for relaxed, beautiful portraits."
      },
      {
         name: "Arjun Studio",
         image: "https://images.unsplash.com/photo-1522075469751-3a381d30f422?auto=format&fit=crop&q=80&w=300&h=300",
         desc: "Specializes in high-energy event photography and corporate branding. Known for quick delivery and sharp, vibrant edits."
      }
  ]);

  useEffect(() => {
    const published = JSON.parse(localStorage.getItem("publishedProfile"));
    if (published) {
       setFeaturedCreators(prev => {
           if (prev.some(c => c.name === published.name)) return prev;
           return [published, ...prev];
       });
       
       // Optional: Clean up query param if we wanted to be fancy, but simple is fine.
    }
  }, []);

  const slides = [
    {
      image: slideimage1,
      title: "Find the Right Photographer Near You — Instantly and Effortlessly",
      desc: "No more endless searching — we connect you with skilled photographers and videographers based in your area. Check availability in real-time and book instantly for events, shoots, or last-minute gigs."
    },
    {
      image: slideimage2,
      title: "Creators You Can Trust — Verified, Top-Rated & Loved by Clients",
      desc: "Every featured creator goes through a quality check and is backed by real reviews and high ratings. You get access to professionals who consistently deliver standout work, so you can book with confidence."
    },
    {
      image: slideimage3,
      title: "Tailored for Your Needs — From Weddings to Brand Shoots, We’ve Got You Covered",
      desc: "Browse creators by style, event type, or vibe — find your perfect match effortlessly."
    },
  ];

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const handleSearch = async () => {
    const city = document.querySelector(".search-bar input").value.trim();
    if (!city) return alert("Please enter a city");

    try {
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${city}`
      );
      const geoData = await geoRes.json();

      if (!geoData || geoData.length === 0) return alert("City not found");

      const { lat, lon } = geoData[0];
      navigate(`/creators?lat=${lat}&lng=${lon}&city=${encodeURIComponent(city)}`);
    } catch (err) {
      console.error(err);
      alert("Error searching for photographers");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const serviceItems = [
    { icon: <Camera size={32} />, text: "Photographer & Videographer Booking", desc: "Event Coverage", bgColor: "grad-pink" },
    { icon: <SquareUser size={32} />, text: "Creator Profile & Portfolio Showcase", desc: "Visual Discovery", bgColor: "grad-cyan" },
    { icon: <CalendarDays size={32} />, text: "Real-Time Availability & Booking Calendar", desc: "Smart Scheduling", bgColor: "grad-orange" },
    { icon: <MapPin size={32} />, text: "Location-Based Filtering", desc: "Nearby Creators", bgColor: "grad-orange" },
    { icon: <BadgeCheck size={32} />, text: "Ratings, Reviews & Trust Badges", desc: "Verified Quality", bgColor: "grad-pink" },
    { icon: <MessagesSquare size={32} />, text: "Custom Shoot Requests & Communication", desc: "Client-Creator Chat", bgColor: "grad-cyan" },
  ];

  const howItWorks = [
    { icon: <Search size={40} />, text: "Discover" },
    { icon: <BadgeCheck size={40} />, text: "BOOK" },
    { icon: <Camera size={40} />, text: "SHOOT" },
  ];

  const testimonials = [
    { name: "AUDREY TURNER", text: "Booked my birthday shoot last minute, and it turned out perfect!", rating: "4.7 Excellent", stars: "★★★★★☆" },
    { name: "JASMINE ANDREWS", text: "Found a fashion photographer nearby in just minutes.", rating: "4.8 Excellent", stars: "★★★★★" },
    { name: "JESSY KIRK", text: "Super intuitive platform and really good support.", rating: "5.0 Excellent", stars: "★★★★★" },
  ];

  return (
    <>
      <Navbar />
      {/* Hero Section */}
      <section className="hero-section">
        <h1>
          Book your perfect shot,<br />
          right around the corner
        </h1>
        <div className="search-bar">
          <Search size={28} className="search-icon" />
          <input type="text" placeholder="Enter your city to find creators" />
          <button onClick={handleSearch}>search</button>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works" id="how">
        <h2>HOW IT WORKS</h2>
        <p className="how-subtitle">Finding and booking your perfect local creator has never been easier</p>
        <div className="steps">
          {howItWorks.map((item, idx) => (
            <div className="step" key={idx}>
              <div className="step-circle">
                {item.icon}
                <p className="step-text">{item.text}</p>
                <div className="step-indicator">
                  <MoveRight size={40} strokeWidth={1} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Creators */}
      <section className="featured-section">
        <div className="featured-container">
          <div className="featured-left">
            <h2>Featured Creators</h2>
            <p>
              Discover talented photographers and videographers handpicked for their creativity, quality, and professionalism. 
              These creators consistently deliver standout work and are highly rated by clients in your area.
            </p>
            <button className="explore-all-btn" onClick={() => navigate("/creators")}>
              Explore All Creators <MoveRight size={16} style={{marginLeft:'8px'}}/>
            </button>
          </div>
          <div className="featured-right">
             {featuredCreators.map((creator, idx) => (
               <div className="featured-card" key={idx}>
                  <div className="featured-img-wrapper">
                     <img src={creator.image} alt={creator.name} />
                  </div>
                  <h3>{creator.name}</h3>
                  <p>{creator.desc}</p>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* Slideshow Section */}
      <section className="slideshow-section">
        <div className="slideshow-container">
          {slides.map((slide, idx) => (
            <div
              key={idx}
              className={`slide ${idx === currentSlide ? "active" : ""}`}
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              <div className="slide-overlay">
                <div className="slide-content">
                  <h6 className="slide-title">{slide.title}</h6>
                  <p className="slide-desc">{slide.desc}</p>
                </div>
              </div>
            </div>
          ))}
          <div className="slide-dots">
            {slides.map((_, idx) => (
              <span
                key={idx}
                className={`dot ${idx === currentSlide ? "active" : ""}`}
                onClick={() => setCurrentSlide(idx)}
              ></span>
            ))}
          </div>
        </div>
      </section>



      {/* Services Section */}
      <section className="services-section">
        <div className="services-container">
          <div className="services-header">
            <h2>Our Solution & <br /> <i>Services.</i></h2>
            <button className="lets-talk-btn">LET'S TALK</button>
          </div>
          
          <div className="services-grid">
            {serviceItems.map((item, idx) => (
              <div key={idx} className="service-card-white">
                <div className={`service-gradient ${item.bgColor}`}></div>
                <div className="service-icon-box">
                  {item.icon}
                </div>
                <h3>{item.text}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="why-choose-section">
        <div className="why-choose-content">
          <div className="why-left">
            <span className="why-label">WHY CHOOSE US</span>
            <h2>CAPTURE <br />MORE THAN <br /><i>PHOTOS</i></h2>
            <div className="stars-decor">
              <span className="star-large">✦</span>
              <span className="star-small">✦</span>
            </div>
            <div className="curly-line">
              <svg width="200" height="100" viewBox="0 0 200 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 80C40 80 50 10 90 40C130 70 150 10 190 20" stroke="white" strokeWidth="1" />
              </svg>
            </div>
          </div>
          <div className="why-right">
            <div className="why-card">
              <div className="why-number active">1</div>
              <div className="why-text">
                <h3>Verified Creators</h3>
                <p>All creators are hand-picked, portfolio-verified, and rated by real clients</p>
              </div>
            </div>
            <div className="why-card">
              <div className="why-number">2</div>
              <div className="why-text">
                <h3>Instant Booking</h3>
                <p>Check availability, view pricing, and lock your slot instantly</p>
              </div>
            </div>
            <div className="why-card">
              <div className="why-number">3</div>
              <div className="why-text">
                <h3>Nearby Talent</h3>
                <p>No matter the event, we connect you with talent that's just around the corner</p>
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* Testimonials */}
      <section className="testimonials-section">
        <div className="testimonials-container">
          <div className="testimonials-left">
            {testimonials.map((t, idx) => (
              <div key={idx} className={`testimonial-card-new card-${idx}`}>
                <div className="t-header">
                  <div className="t-avatar">
                     {/* Using a placeholder or the uploaded images if available, for now randomuser */}
                     <img src={`https://randomuser.me/api/portraits/women/${44 + idx}.jpg`} alt={t.name} />
                  </div>
                  <span className="t-name">{t.name}</span>
                </div>
                <p className="t-text">“{t.text}”</p>
                <div className="t-footer">
                   <span className="t-rating-text">{t.rating}</span>
                   <span className="t-stars">{t.stars}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="testimonials-right">
             <h2>We’re helping <br/> <span className="star-yellow">✨</span> clients capture <br/> memories <br/> across the map.</h2>
             <p>So whether it's a wedding, pre-wedding, birthday, or shoot for your brand —our creators deliver more than photos; they deliver moments</p>
             <button className="explore-all-btn" onClick={() => navigate("/creators")}>EXPLORE ALL</button>
             <div className="loop-decor"></div>
          </div>
        </div>
      </section>

      {/* Book Now Section */}
      <section className="book-now" id="book">
        <div className="book-now-container">
          <div className="book-now-content-wrapper">
            <h2>
              <span className="highlight-event">Event in mind?</span><br />
              Let's work together <br />
              to execute.
            </h2>
            <p className="book-now-desc">From personal moments to professional shoots — we've got the right talent nearby</p>
            
            <div className="book-action">
               <div className="curly-doodle">
                 <img src={newSpiral} alt="decoration" className="curly-doodle-img" />
               </div>
               <button>BOOK NOW</button>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="newsletter-section">
        <div className="newsletter-content">
          <div className="newsletter-left">
            <h2>Stay in the Frame. Get <br /> Creator Updates.</h2>
          </div>
          <div className="newsletter-right">
             <div className="newsletter-box">
                <div className="newsletter-form">
                  <input type="email" placeholder="Enter your email" />
                  <button>SEND</button>
                </div>
                <div className="newsletter-subtext">
                  <span>Already subscribed?</span> <br/>
                  <a href="#">Unsubscribe</a>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer-new">
        <div className="footer-container">
           <div className="footer-left">
              <div className="footer-logo">
                 <Camera size={24} strokeWidth={1.5} />
                 <span>PIXLO</span>
              </div>
              <p className="footer-address">
                210 Creative Lens Lane,<br/>
                Hyderabad, Telangana, India
              </p>
           </div>
           
           <div className="footer-center">
              <div className="social-links">
                 <a href="#" className="social-icon"><Facebook size={18} /></a>
                 <a href="#" className="social-icon"><Instagram size={18} /></a>
                 <a href="#" className="social-icon"><Twitter size={18} /></a>
                 <a href="#" className="social-icon"><Linkedin size={18} /></a>
              </div>
              <p className="copyright-text">@2025. All Right Reserved</p>
           </div>
           
           <div className="footer-right">
              <a href="#">Explore Creators</a>
              <a href="#">Contact</a>
           </div>
        </div>
      </footer>
    </>
  );
};

export default Home;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.jpg";
import defaultProfile from "../assets/default-profile-pic.png";
import { Lightbulb } from "lucide-react";
import "./PhotographerServices.css"; 
// import "./PhotographerPortfolio.css"; // Reuse header styles if needed, but we used custom css above

const PhotographerServices = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  // State for services
  const [services, setServices] = useState([
      { id: 1, name: "1 Hour portrait shoot", description: "", duration: 1, price: 1, deliverables: "What will clients receive" },
      { id: 2, name: "1 Hour portrait shoot", description: "", duration: 1, price: 1, deliverables: "What will clients receive" },
      { id: 3, name: "1 Hour portrait shoot", description: "", duration: 1, price: 1, deliverables: "What will clients receive" },
      { id: 4, name: "1 Hour portrait shoot", description: "", duration: 1, price: 1, deliverables: "What will clients receive" },
  ]);

  const handleAddService = () => {
      setServices(prev => [
          ...prev, 
          { 
              id: prev.length + 1, 
              name: "", 
              description: "", 
              duration: 1, 
              price: 0, 
              deliverables: "" 
          }
      ]);
  };

  const handleRemoveService = (id) => {
      setServices(prev => prev.filter(s => s.id !== id));
  };

  const handleInputChange = (id, field, value) => {
      setServices(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleContinue = () => {
      // Navigate to Availability
      navigate("/portfolio/availability"); 
  };

  const handleBack = () => {
      navigate("/portfolio/media");
  };

  return (
    <div className="services-page">
      {/* Header */}
      <div className="portfolio-header">
         <div className="header-left">
            <img src={logo} alt="Pixlo" className="header-logo" />
            <h2>Service & Pricing</h2>
         </div>
         <div className="header-right">
             <div className="user-avatar-small">
                 <img src={user?.profilePic || defaultProfile} alt="Profile" />
             </div>
         </div>
      </div>

      <div className="services-content">
          
          <h3 className="services-page-title">Service & Pricing</h3>
          <p className="services-page-subtitle">Define the photography and videography services you offer to clients</p>
          
          <div className="services-grid">
              {services.map((service, index) => (
                  <div className="service-card" key={service.id}>
                      <div className="service-card-header" style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                          <span>Service #{index + 1}</span>
                          <button 
                              onClick={() => handleRemoveService(service.id)} 
                              className="remove-service-btn"
                              title="Remove Service"
                          >
                            ✖
                          </button>
                      </div>
                      
                      {/* Name */}
                      <div className="input-group">
                          <label>Service #{index + 1}</label>
                          <input 
                              type="text" 
                              className="dark-input-service"
                              value={service.name}
                              onChange={(e) => handleInputChange(service.id, 'name', e.target.value)}
                              placeholder="1 Hour portrait shoot" 
                          />
                      </div>

                      {/* Description */}
                      <div className="input-group">
                          <label>Description</label>
                          <div className="desc-box-service">
                              <div className="desc-toolbar-service">
                                  <span>Roboto</span> <span>Paragraph</span>
                              </div>
                              <textarea 
                                  className="desc-input-service"
                                  value={service.description}
                                  onChange={(e) => handleInputChange(service.id, 'description', e.target.value)}
                                  placeholder="Your text goes here"
                              ></textarea>
                          </div>
                      </div>

                      {/* Duration & Price */}
                      <div className="row-2-col">
                          <div className="input-group">
                              <label>Duration(hours)</label>
                              <div className="number-input-container">
                                  <input 
                                      type="number" 
                                      className="number-input-field" 
                                      value={service.duration}
                                      onChange={(e) => handleInputChange(service.id, 'duration', e.target.value)}
                                  />
                                  <div className="spinner-btns">
                                      <button className="spinner-btn" onClick={() => handleInputChange(service.id, 'duration', Number(service.duration) + 1)}>▲</button>
                                      <button className="spinner-btn" onClick={() => handleInputChange(service.id, 'duration', Math.max(0, Number(service.duration) - 1))}>▼</button>
                                  </div>
                              </div>
                          </div>
                          <div className="input-group">
                              <label>Price(₹)</label>
                              <div className="number-input-container">
                                  <input 
                                      type="number" 
                                      className="number-input-field" 
                                      value={service.price}
                                      onChange={(e) => handleInputChange(service.id, 'price', e.target.value)}
                                  />
                                  <div className="spinner-btns">
                                      <button className="spinner-btn" onClick={() => handleInputChange(service.id, 'price', Number(service.price) + 100)}>▲</button>
                                      <button className="spinner-btn" onClick={() => handleInputChange(service.id, 'price', Math.max(0, Number(service.price) - 100))}>▼</button>
                                  </div>
                              </div>
                          </div>
                      </div>

                      {/* Deliverables - Separate Row */}
                      <div className="input-group deliverables-row" style={{marginTop:'1.5rem', display:'block', width:'100%'}}>
                          <label>Deliverables</label>
                          <input 
                              type="text" 
                              className="dark-input-service"
                              value={service.deliverables}
                              onChange={(e) => handleInputChange(service.id, 'deliverables', e.target.value)}
                              placeholder="What will clients receive (e.g. 50 photos)" 
                              style={{width:'100%'}}
                          />
                      </div>

                  </div>
              ))}
          </div>

          <div className="add-service-btn-container">
              <button className="gold-btn-service" onClick={handleAddService}>Add More Services</button>
          </div>

          {/* Tips Section */}
          <div className="tips-section-service">
              <div className="tips-header-service">
                  <Lightbulb color="#FFD700" size={20} fill="#FFD700" />
                  <h4>Tips for creating effective service packages</h4>
              </div>
              <ul className="tips-list-service">
                  <li>Be specific about what's included to set clear expectations</li>
                  <li>Consider offering tiered packages (basic, standard, premium)</li>
                  <li>Include your turnaround time for deliverables</li>
                  <li>Mention any additional fees that might apply</li>
                  <li>Highlight your unique selling points that differentiate your services</li>
              </ul>
          </div>

          {/* Footer */}
          <div className="service-footer">
              <button className="btn-back" onClick={handleBack} style={{background: '#fff', color:'#000', border:'none', padding:'0.8rem 2rem', borderRadius:'30px', fontWeight:'600', cursor:'pointer'}}>Back</button>
              <button className="btn-continue" onClick={handleContinue} style={{background: '#CBB26A', color:'#000', border:'none', padding:'0.8rem 2.5rem', borderRadius:'30px', fontWeight:'600', cursor:'pointer'}}>Continue</button>
          </div>

      </div>
    </div>
  );
};

export default PhotographerServices;

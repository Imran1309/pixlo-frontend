import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.jpg";
import defaultProfile from "../assets/default-profile-pic.png";
import { Upload, Lightbulb, X } from "lucide-react"; 
import "./PortfolioMedia.css";
import "./PhotographerPortfolio.css"; // Reuse header styles

const PortfolioMedia = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  // Mock data for images to match screenshot
  const [images, setImages] = useState([
    "https://images.unsplash.com/photo-1555663731-893bd57d9f75?auto=format&fit=crop&w=300&q=80", // Parrot
    "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=300&q=80", // Wedding
    "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=300&q=80", // Child
    "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=300&q=80", // Fashion
    "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=300&q=80"  // Portrait
  ]);

  const [videos, setVideos] = useState([
    { id: 1, link: '', title: '', description: '', isUploaded: false },
    { id: 2, link: '', title: '', description: '', isUploaded: false },
    { id: 3, link: '', title: '', description: '', isUploaded: false }
  ]);

  const handleVideoChange = (id, field, value) => {
    setVideos(prev => prev.map(v => v.id === id ? { ...v, [field]: value } : v));
  };

  const handleUploadVideo = (id) => {
    setVideos(prev => prev.map(v => v.id === id ? { ...v, isUploaded: true } : v));
  };

  // Placeholder state for file input ref
  const fileInputRef = React.useRef(null);

  const handleBrowseClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      // Create local object URLs for preview
      const newImages = files.map(file => URL.createObjectURL(file));
      setImages(prev => [...prev, ...newImages]);
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setImages(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleAddVideo = () => {
    setVideos(prev => [...prev, { id: Date.now(), link: '', title: '', description: '', isUploaded: false }]);
  };

  const handleVideoFileChange = (id, e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideos(prev => prev.map(v => v.id === id ? { ...v, link: url, title: file.name } : v));
    }
  };

  const handleContinue = () => {
      // Navigate to services page
      navigate("/portfolio/services");
  };

  return (
    <div className="portfolio-media-page">
      {/* Header */}
      <div className="portfolio-header">
         <div className="header-left">
            <img src={logo} alt="Pixlo" className="header-logo" />
            <h2>Portfolio Upload</h2>
         </div>
         <div className="header-right">
             <div className="user-avatar-small">
                 <img src={user?.profilePic || defaultProfile} alt="Profile" />
             </div>
         </div>
      </div>

      <div className="media-content">
          
          {/* Upload Section */}
          <h3 className="media-section-title">Upload your work</h3>
          <p className="media-section-subtitle">Upload high quality images that best represent your style and skills</p>
          
          <div className="upload-box">
              <Upload className="upload-icon" />
              <div className="upload-text">Drag and drop your images here</div>
              <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  ref={fileInputRef} 
                  style={{display: 'none'}} 
                  onChange={handleFileChange}
              />
              <button className="browse-btn" onClick={handleBrowseClick}>Browse files</button>
          </div>

          {/* Images Grid */}
          <div className="images-grid">
              {images.map((img, idx) => (
                  <div className="image-card" key={idx}>
                      <img src={img} alt="Portfolio" />
                      <button className="remove-image-btn" onClick={() => handleRemoveImage(idx)} title="Remove image">
                          <X size={16} />
                      </button>
                  </div>
              ))}
          </div>

          <div className="add-more-btn-container">
              <button className="gold-btn" onClick={handleBrowseClick}>Add More Pictures</button>
          </div>

          {/* Videos Section */}
          <h3 className="media-section-title">Videos</h3>
          <p className="media-section-subtitle">Add links to your videos hosted on youtube or anywhere to showcase your videography skills</p>

          <div className="video-grid">
              {videos.map((v) => (
                  <div className="video-card" key={v.id}>
                      {v.isUploaded ? (
                          <div className="video-preview">
                              {/* If link is a youtube link or instagram link, render an iframe, otherwise fallback to video tag */}
                              {v.link.includes('youtube.com') || v.link.includes('youtu.be') ? (
                                  <iframe 
                                      width="100%" 
                                      height="200" 
                                      src={v.link.replace("watch?v=", "embed/").replace("youtu.be/", "www.youtube.com/embed/")} 
                                      title={v.title}
                                      frameBorder="0" 
                                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                      allowFullScreen
                                      className="video-player"
                                  ></iframe>
                              ) : v.link.includes('instagram.com') ? (
                                  <iframe 
                                      width="100%" 
                                      height="220" 
                                      src={`${v.link.split('?')[0].replace(/\/$/, '')}/embed`} 
                                      title={v.title}
                                      frameBorder="0" 
                                      allow="encrypted-media"
                                      allowFullScreen
                                      className="video-player"
                                  ></iframe>
                              ) : (
                                  <video width="100%" height="200" controls className="video-player" src={v.link}>
                                      Your browser does not support the video tag.
                                  </video>
                              )}
                              <h4 className="video-preview-title">{v.title || "Untitled Video"}</h4>
                              <p className="video-preview-desc">{v.description || "No description provided."}</p>
                              <div className="card-footer">
                                  <button className="mini-upload-btn" onClick={() => handleVideoChange(v.id, 'isUploaded', false)}>Edit</button>
                              </div>
                          </div>
                      ) : (
                          <>
                              <div className="input-group">
                                  <label>Video Link or Upload File</label>
                                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                                      <input type="text" placeholder="https://youtube.com/..." className="dark-input" value={v.link} onChange={(e) => handleVideoChange(v.id, 'link', e.target.value)} />
                                      <input 
                                          type="file" 
                                          accept="video/*" 
                                          id={`video-upload-${v.id}`}
                                          style={{ display: 'none' }}
                                          onChange={(e) => handleVideoFileChange(v.id, e)}
                                      />
                                      <label htmlFor={`video-upload-${v.id}`} className="mini-upload-btn" style={{ cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                          Browse
                                      </label>
                                  </div>
                              </div>
                              <div className="input-group">
                                  <label>Video Title</label>
                                  <input type="text" placeholder="Wedding Reel" className="dark-input" value={v.title} onChange={(e) => handleVideoChange(v.id, 'title', e.target.value)} />
                              </div>
                              <div className="input-group">
                                  <label>Description(optional)</label>
                                  <div className="desc-box">
                                      <div className="desc-toolbar">
                                          <span>Roboto</span> <span>Paragraph</span>
                                      </div>
                                      <textarea placeholder="Your text goes here" className="desc-input" value={v.description} onChange={(e) => handleVideoChange(v.id, 'description', e.target.value)}></textarea>
                                  </div>
                              </div>
                              <div className="card-footer">
                                  <button className="mini-upload-btn" onClick={() => handleUploadVideo(v.id)}>Upload</button>
                              </div>
                          </>
                      )}
                  </div>
              ))}
          </div>

          <div className="add-more-btn-container">
              <button className="gold-btn" onClick={handleAddVideo}>Add More Videos</button>
          </div>

          {/* Tips Section */}
          <div className="tips-section">
              <div className="tips-header">
                  <Lightbulb color="#FFD700" size={24} fill="#FFD700" />
                  <h4>Tips for a Great Portfolio</h4>
              </div>
              <ul className="tips-list">
                  <li>Upload 5-10 of your best and most recent work samples</li>
                  <li>Include a variety of styles to showcase your versatility</li>
                  <li>Make sure your images are high resolution and properly exposed</li>
                  <li>Add descriptive captions to provide context for your work</li>
                  <li>For videos, choose short clips (2-3 minutes) that highlight your skills</li>
              </ul>
          </div>

          {/* Footer */}
          <div className="media-footer">
              <button className="btn-back" onClick={() => navigate('/portfolio')}>Back</button>
              <button className="btn-continue" onClick={handleContinue}>Continue</button>
          </div>

      </div>
    </div>
  );
};

export default PortfolioMedia;

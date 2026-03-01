import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../assets/logo.jpg";
import defaultProfile from "../assets/default-profile-pic.png";
import { Upload, Lightbulb, X, Plus } from "lucide-react";
import "./PortfolioMedia.css";
import "./PhotographerPortfolio.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const PortfolioMedia = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");
  const userId = user?._id; // correct field

  const fileInputRef = useRef(null);

  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [uploading, setUploading] = useState(false);

  /* =============================
        FETCH DATA
  ============================= */
  useEffect(() => {
    if (!userId) return;
    fetchPhotographerData();
  }, []);

  const fetchPhotographerData = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/photographers/profile/${userId}`);
      const p = res.data.photographer;
      if (p) {
        setImages(p.portfolioImages || []);
        setVideos(
          (p.portfolioVideos || []).map((v) => ({
            ...v,
            isUploaded: true,
            link: v.videoLink || "",
          }))
        );
      }
    } catch (err) {
      console.warn("Could not load portfolio data:", err.message);
    }
  };

  /* =============================
        IMAGE UPLOAD
  ============================= */
  const handleBrowseClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setUploading(true);
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("images", file));
      formData.append("userId", userId);

      const res = await axios.post(
        `${API_URL}/api/photographers/portfolio/images`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (res.data.photographer) {
        setImages(res.data.photographer.portfolioImages || []);
      }
    } catch (err) {
      console.error("Image upload error:", err);
      alert("Failed to upload images. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  /* =============================
        DELETE IMAGE
  ============================= */
  const handleRemoveImage = async (public_id) => {
    try {
      await axios.delete(`${API_URL}/api/photographers/portfolio/image/delete`, {
        data: { userId, public_id },
      });
      setImages((prev) => prev.filter((img) => img.public_id !== public_id));
    } catch (err) {
      console.error("Image delete error:", err);
      alert("Failed to delete image.");
    }
  };

  /* =============================
        VIDEO HANDLING
  ============================= */
  const handleVideoChange = (id, field, value) => {
    setVideos((prev) =>
      prev.map((v) => (v._id === id || v.tempId === id ? { ...v, [field]: value } : v))
    );
  };

  const handleAddVideo = () => {
    setVideos((prev) => [
      ...prev,
      {
        tempId: Date.now(),
        link: "",
        title: "",
        description: "",
        isUploaded: false,
      },
    ]);
  };

  const handleSaveVideo = async (video) => {
    try {
      if (video._id) {
        // UPDATE existing
        const res = await axios.put(
          `${API_URL}/api/photographers/portfolio/video/edit`,
          {
            userId,
            videoId: video._id,
            updatedVideo: {
              videoLink: video.link || video.videoLink,
              title: video.title,
              description: video.description,
            },
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.data.photographer) {
          setVideos(
            (res.data.photographer.portfolioVideos || []).map((v) => ({
              ...v,
              isUploaded: true,
              link: v.videoLink || "",
            }))
          );
        }
      } else {
        // ADD NEW
        const res = await axios.post(
          `${API_URL}/api/photographers/portfolio/video`,
          {
            userId,
            videoLink: video.link,
            title: video.title,
            description: video.description,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.data.photographer) {
          setVideos(
            (res.data.photographer.portfolioVideos || []).map((v) => ({
              ...v,
              isUploaded: true,
              link: v.videoLink || "",
            }))
          );
        }
      }
    } catch (err) {
      console.error("Video save error:", err);
      alert("Failed to save video. Please try again.");
    }
  };

  const handleDeleteVideo = async (videoId) => {
    if (!window.confirm("Delete this video?")) return;
    try {
      await axios.delete(`${API_URL}/api/photographers/portfolio/video/delete`, {
        data: { userId, videoId },
        headers: { Authorization: `Bearer ${token}` },
      });
      setVideos((prev) => prev.filter((v) => v._id !== videoId));
    } catch (err) {
      console.error("Video delete error:", err);
      alert("Failed to delete video.");
    }
  };

  const handleContinue = () => {
    navigate("/portfolio/services");
  };

  return (
    <div className="portfolio-media-page">
      {/* HEADER */}
      <div className="portfolio-header">
        <div className="header-left">
          <img src={logo} className="header-logo" alt="Pixlo" onClick={() => navigate("/")} style={{ cursor: "pointer" }} />
          <h2>Portfolio Upload</h2>
        </div>
        <div className="user-avatar-small">
          <img src={user?.profilePic || defaultProfile} alt="Profile" />
        </div>
      </div>

      <div className="media-content">
        {/* IMAGE UPLOAD */}
        <div className="upload-box" onClick={handleBrowseClick} style={{ cursor: "pointer" }}>
          <Upload size={32} color="#CBB26A" />
          <p style={{ color: "#aaa", marginTop: "0.5rem" }}>
            {uploading ? "Uploading..." : "Click to browse or drag & drop images"}
          </p>
          <input
            type="file"
            multiple
            accept="image/*"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
          <button
            className="browse-btn"
            onClick={(e) => { e.stopPropagation(); handleBrowseClick(); }}
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Browse files"}
          </button>
        </div>

        {/* IMAGE GRID */}
        {images.length > 0 && (
          <div className="images-grid">
            {images.map((img) => (
              <div className="image-card" key={img.public_id || img.url}>
                <img src={img.url} alt="Portfolio" />
                <button
                  className="remove-image-btn"
                  onClick={() => handleRemoveImage(img.public_id)}
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* VIDEO SECTION */}
        <h3 style={{ color: "#fff", marginTop: "2rem", marginBottom: "1rem" }}>Portfolio Videos</h3>
        <p style={{ color: "#aaa", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
          Add YouTube or other video links to showcase your work
        </p>

        <div className="video-grid">
          {videos.map((v) => (
            <div className="video-card" key={v._id || v.tempId}>
              {v.isUploaded ? (
                <>
                  {v.link && (
                    <iframe
                      width="100%"
                      height="200"
                      src={v.link.replace("watch?v=", "embed/")}
                      allowFullScreen
                      title={v.title}
                      style={{ borderRadius: "8px", border: "none" }}
                    />
                  )}
                  <h4 style={{ color: "#fff", margin: "0.5rem 0" }}>{v.title}</h4>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      style={{ background: "#333", color: "#fff", border: "none", padding: "0.4rem 0.8rem", borderRadius: "6px", cursor: "pointer" }}
                      onClick={() => setVideos((prev) => prev.map((x) => x._id === v._id ? { ...x, isUploaded: false } : x))}
                    >
                      Edit
                    </button>
                    <button
                      style={{ background: "#c0392b", color: "#fff", border: "none", padding: "0.4rem 0.8rem", borderRadius: "6px", cursor: "pointer" }}
                      onClick={() => handleDeleteVideo(v._id)}
                    >
                      Delete
                    </button>
                  </div>
                </>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <input
                    value={v.link || ""}
                    placeholder="YouTube / Video URL (e.g. https://youtube.com/watch?v=...)"
                    onChange={(e) => handleVideoChange(v._id || v.tempId, "link", e.target.value)}
                    style={{ background: "#222", color: "#fff", border: "1px solid #444", borderRadius: "8px", padding: "0.6rem", width: "100%", boxSizing: "border-box" }}
                  />
                  <input
                    value={v.title || ""}
                    placeholder="Video title"
                    onChange={(e) => handleVideoChange(v._id || v.tempId, "title", e.target.value)}
                    style={{ background: "#222", color: "#fff", border: "1px solid #444", borderRadius: "8px", padding: "0.6rem", width: "100%", boxSizing: "border-box" }}
                  />
                  <textarea
                    value={v.description || ""}
                    placeholder="Description (optional)"
                    rows={2}
                    onChange={(e) => handleVideoChange(v._id || v.tempId, "description", e.target.value)}
                    style={{ background: "#222", color: "#fff", border: "1px solid #444", borderRadius: "8px", padding: "0.6rem", width: "100%", boxSizing: "border-box", resize: "vertical" }}
                  />
                  <button
                    onClick={() => handleSaveVideo(v)}
                    style={{ background: "#CBB26A", color: "#000", border: "none", padding: "0.6rem 1.2rem", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }}
                  >
                    Save Video
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={handleAddVideo}
          style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "transparent", border: "1px dashed #CBB26A", color: "#CBB26A", padding: "0.6rem 1.2rem", borderRadius: "8px", cursor: "pointer", marginTop: "1rem" }}
        >
          <Plus size={16} /> Add Video Link
        </button>

        <div className="media-footer">
          <button onClick={() => navigate("/portfolio")}>Back</button>
          <button onClick={handleContinue}>Continue</button>
        </div>
      </div>
    </div>
  );
};

export default PortfolioMedia;

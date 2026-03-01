import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../assets/logo.jpg";
import defaultProfile from "../assets/default-profile-pic.png";
import { Upload, Lightbulb, X } from "lucide-react";
import "./PortfolioMedia.css";
import "./PhotographerPortfolio.css";

const API_URL = import.meta.env.VITE_API_URL;
const API = `${API_URL}/api/photographers`;

const PortfolioMedia = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const fileInputRef = useRef(null);

  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);

  /* =============================
        FETCH DATA
  ============================= */

  useEffect(() => {
    fetchImages();
    fetchVideos();
  }, []);

  const fetchImages = async () => {
    const token = localStorage.getItem("token");
    const res = await axios.get(`${API}/profile/${user._id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setImages(res.data.photographer?.portfolioImages || []);
  };

  const fetchVideos = async () => {
    const token = localStorage.getItem("token");
    const res = await axios.get(`${API}/profile/${user._id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setVideos((res.data.photographer?.portfolioVideos || []).map((v) => ({ ...v, isUploaded: true })));
  };

  /* =============================
        IMAGE UPLOAD
  ============================= */

  const handleBrowseClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);

    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));
    formData.append("userId", user._id);

    const token = localStorage.getItem("token");
    const res = await axios.post(`${API}/portfolio/images`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`
      }
    });

    setImages(res.data.photographer.portfolioImages);
  };

  /* =============================
        DELETE IMAGE
  ============================= */

  const handleRemoveImage = async (public_id) => {
    const token = localStorage.getItem("token");
    await axios.delete(`${API}/portfolio/image/delete`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { public_id },
    });

    setImages((prev) => prev.filter((img) => img.public_id !== public_id));
  };

  /* =============================
        VIDEO HANDLING
  ============================= */

  const getEmbedUrl = (url) => {
    if (!url) return "";
    let videoId = "";
    if (url.includes("youtube.com/watch?v=")) {
      videoId = url.split("v=")[1].split("&")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    } else if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1].split("?")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    } else if (url.includes("vimeo.com/")) {
      videoId = url.split("vimeo.com/")[1].split("?")[0];
      return `https://player.vimeo.com/video/${videoId}`;
    }
    return url;
  };

  const handleVideoChange = (id, field, value) => {
    setVideos((prev) =>
      prev.map((v) => (v._id === id || v.id === id ? { ...v, [field]: value } : v)),
    );
  };

  /* ---------- ADD / UPDATE VIDEO ---------- */

  const handleUploadVideo = async (video) => {
    const token = localStorage.getItem("token");

    if (!video.videoLink && !video.link) {
      alert("Please enter a video link");
      return;
    }
    if (!video.title) {
      alert("Please enter a title");
      return;
    }

    try {
      if (video._id) {
        // UPDATE
        const res = await axios.put(`${API}/portfolio/video/edit`, {
          videoId: video._id,
          updatedVideo: {
            videoLink: video.videoLink || video.link,
            title: video.title,
            description: video.description
          },
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        alert("Video updated successfully!");
        setVideos((res.data.photographer.portfolioVideos || []).map((v) => ({ ...v, isUploaded: true })));
      } else {
        // ADD NEW
        const res = await axios.post(`${API}/portfolio/video`, {
          videoLink: video.videoLink || video.link,
          title: video.title,
          description: video.description,
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        alert("Video added successfully!");
        setVideos((res.data.photographer.portfolioVideos || []).map((v) => ({ ...v, isUploaded: true })));
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error uploading video");
    }
  };

  /* ---------- DELETE VIDEO ---------- */

  const handleDeleteVideo = async (videoId) => {
    const token = localStorage.getItem("token");
    await axios.delete(`${API}/portfolio/video/delete`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        videoId,
      },
    });

    setVideos((prev) => prev.filter((v) => v._id !== videoId));
  };

  const handleAddVideo = () => {
    setVideos((prev) => [
      ...prev,
      {
        id: Date.now(),
        videoLink: "",
        title: "",
        description: "",
        isUploaded: false,
      },
    ]);
  };

  const handleContinue = () => {
    navigate("/portfolio/services");
  };

  return (
    <div className="portfolio-media-page">
      <div className="media-content">
        <h1 className="media-section-title">Portfolio Media</h1>
        <p className="media-section-subtitle">
          Upload high-quality images and add video links to showcase your best work to potential clients.
        </p>
        {/* UPLOAD BOX */}
        <div className="upload-box" onClick={handleBrowseClick}>
          <Upload />
          <p>Click to browse or drag and drop images</p>
          <input
            type="file"
            multiple
            accept="image/*"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
          <button className="browse-btn">
            Browse files
          </button>
        </div>

        {/* IMAGE GRID */}
        <div className="images-grid">
          {images.map((img) => (
            <div className="image-card" key={img.public_id}>
              <img src={img.url} />
              <button
                className="remove-image-btn"
                onClick={() => handleRemoveImage(img.public_id)}
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>

        {/* VIDEOS */}
        <div className="video-grid">
          {videos.map((v) => (
            <div className="video-card" key={v._id || v.id}>
              {v.isUploaded ? (
                <>
                  <iframe
                    src={getEmbedUrl(v.videoLink || v.link || "")}
                    title={v.title}
                    allowFullScreen
                  />
                  <h4 className="video-preview-title">{v.title}</h4>
                  <p className="video-preview-desc">{v.description}</p>

                  <div className="card-footer">
                    <button className="delete-video-btn" onClick={() => handleDeleteVideo(v._id)}>
                      Delete
                    </button>
                    <button
                      className="mini-upload-btn"
                      onClick={() =>
                        setVideos((prev) =>
                          prev.map((x) =>
                            x._id === v._id ? { ...x, isUploaded: false } : x,
                          ),
                        )
                      }
                    >
                      Edit
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="input-group">
                    <label>Video Link</label>
                    <input
                      className="dark-input"
                      value={v.videoLink || v.link || ""}
                      placeholder="e.g. https://youtube.com/..."
                      onChange={(e) =>
                        handleVideoChange(v._id || v.id, "videoLink", e.target.value)
                      }
                    />
                  </div>

                  <div className="input-group">
                    <label>Title</label>
                    <input
                      className="dark-input"
                      value={v.title}
                      placeholder="Enter video title"
                      onChange={(e) =>
                        handleVideoChange(v._id || v.id, "title", e.target.value)
                      }
                    />
                  </div>

                  <div className="input-group">
                    <label>Description</label>
                    <div className="desc-box">
                      <textarea
                        className="desc-input"
                        value={v.description}
                        placeholder="What is this video about?"
                        onChange={(e) =>
                          handleVideoChange(
                            v._id || v.id,
                            "description",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                  </div>

                  <div className="card-footer">
                    <button className="mini-upload-btn" onClick={() => handleUploadVideo(v)}>
                      {v._id ? "Update Video" : "Upload Video"}
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="add-video-container">
          <button className="add-video-btn" onClick={handleAddVideo}>
            + Add Another Video
          </button>
        </div>

        <div className="media-footer">
          <button className="btn-back-media" onClick={() => navigate("/portfolio")}>
            Back
          </button>
          <button className="btn-continue-media" onClick={handleContinue}>
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default PortfolioMedia;

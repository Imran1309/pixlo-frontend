import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import "./PortfolioMedia.css";

const PortfolioImagesPage = ({ userId, setPhotographer }) => {
  const [files, setFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [photographerData, setPhotographerData] = useState(null);
  const fileInputRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL; // ⬅ ENV USED HERE

  // Fetch photographer data
  useEffect(() => {
    const fetchPhotographer = async () => {
      try {
        const res = await axios.get(
          `${API_URL}/api/photographers/profile/${userId}`,
        );
        setPhotographerData(res.data.photographer);
        setPhotographer(res.data.photographer);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch photographer data.");
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchPhotographer();
  }, [userId, setPhotographer, API_URL]);

  // Handle file selection
  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
    const urls = selectedFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  // Upload images
  const uploadImages = async () => {
    if (files.length === 0)
      return toast.error("Please select images to upload.");

    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));
    formData.append("userId", userId);

    try {
      setUploading(true);
      const res = await axios.post(
        `${API_URL}/api/photographers/portfolio/images`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );

      setPhotographerData(res.data.photographer);
      setPhotographer(res.data.photographer);
      toast.success("Images uploaded successfully!");

      setFiles([]);
      setPreviewUrls([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload images.");
    } finally {
      setUploading(false);
    }
  };

  // Delete image
  const deleteImage = async (public_id) => {
    if (!photographerData?.portfolioImages) return;

    try {
      const res = await axios.delete(
        `${API_URL}/api/photographers/portfolio/image/delete`,
        {
          data: { userId, public_id },
        },
      );

      setPhotographerData(res.data.photographer);
      setPhotographer(res.data.photographer);
      toast.success("Image deleted successfully!");
    } catch (err) {
      console.error("Error deleting portfolio image:", err);
      toast.error("Failed to delete image.");
    }
  };
  if (loading) return <p style={{ color: "#b3995e" }}>Loading...</p>;

  return (
    <div className="media-container">
      <Toaster position="top-right" reverseOrder={false} />

      <h2>Upload Portfolio Images</h2>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleImageChange}
      />

      <button onClick={uploadImages} disabled={uploading}>
        {uploading ? "Uploading..." : "Upload"}
      </button>

      {previewUrls.length > 0 && (
        <div className="media-preview">
          {previewUrls.map((url, idx) => (
            <img key={`preview-${idx}`} src={url} alt={`preview-${idx}`} />
          ))}
        </div>
      )}

      {photographerData?.portfolioImages?.length > 0 && (
        <div>
          <h3 style={{ color: "#b3995e", marginTop: "1rem" }}>Images</h3>
          <div className="media-preview">
            {photographerData.portfolioImages.map((img, idx) => (
              <div key={`existing-${idx}`} style={{ position: "relative" }}>
                <img
                  src={img.url}
                  alt={`portfolio-${idx}`}
                  style={{ width: "100%", borderRadius: "6px" }}
                />

                <button
                  style={{
                    position: "absolute",
                    top: "5px",
                    right: "5px",
                    background: "#a08a4d",
                    color: "black",
                    border: "none",
                    borderRadius: "4px",
                    padding: "2px 6px",
                    cursor: "pointer",
                  }}
                  onClick={() => deleteImage(img.public_id)}
                >
                  X
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioImagesPage;

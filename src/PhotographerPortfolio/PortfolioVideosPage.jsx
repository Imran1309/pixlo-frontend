import React, { useState, useEffect } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import "./PortfolioMedia.css";

const API = import.meta.env.VITE_API_URL; // ⭐ BASE URL

const PortfolioVideosPage = ({ userId, setPhotographer }) => {
  const [photographerData, setPhotographerData] = useState(null);
  const [videoLink, setVideoLink] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editVideo, setEditVideo] = useState(null);

  // Fetch photographer data
  useEffect(() => {
    const fetchPhotographer = async () => {
      try {
        const res = await axios.get(`${API}/api/photographers/profile/${userId}`);
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
  }, [userId, setPhotographer]);

  // Add new video
  const addVideo = async () => {
    if (!videoLink || !title) return toast.error("Video link and title are required.");

    try {
      setUploading(true);

      const res = await axios.post(`${API}/api/photographers/portfolio/video`, {
        userId,
        videoLink,
        title,
        description,
      });

      setPhotographerData(res.data.photographer);
      setPhotographer(res.data.photographer);

      toast.success("Video added successfully!");

      setVideoLink("");
      setTitle("");
      setDescription("");
    } catch (err) {
      console.error(err);
      toast.error("Failed to add video.");
    } finally {
      setUploading(false);
    }
  };

  // Delete video
  const deleteVideo = async (videoId) => {
    try {
      const res = await axios.delete(`${API}/api/photographers/portfolio/video/delete`, {
        data: { userId, videoId },
      });

      setPhotographerData(res.data.photographer);
      setPhotographer(res.data.photographer);

      toast.success("Video deleted successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete video.");
    }
  };

  // Save video edit
  const saveEdit = async () => {
    if (!editVideo.videoLink || !editVideo.title)
      return toast.error("Video link and title are required.");

    try {
      setUploading(true);

      const res = await axios.put(`${API}/api/photographers/portfolio/video/edit`, {
        userId,
        videoId: editVideo._id,
        updatedVideo: editVideo,
      });

      setPhotographerData(res.data.photographer);
      setPhotographer(res.data.photographer);

      toast.success("Video updated successfully!");
      setEditVideo(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update video.");
    } finally {
      setUploading(false);
    }
  };

  // Convert YouTube/Vimeo URLs to embed URL
  const getEmbedUrl = (videoLink) => {
    if (videoLink.includes("youtube.com/watch?v="))
      return videoLink.replace("watch?v=", "embed/");

    if (videoLink.includes("youtu.be/"))
      return videoLink.replace("youtu.be/", "www.youtube.com/embed/");

    if (videoLink.includes("vimeo.com/"))
      return videoLink.replace("vimeo.com/", "player.vimeo.com/video/");

    return "";
  };

  if (loading) return <p style={{ color: "#b3995e" }}>Loading...</p>;

  return (
    <div className="media-container">
      <Toaster position="top-right" />

      <h2>Add Portfolio Video</h2>

      <input
        type="text"
        placeholder="Video URL"
        value={videoLink}
        onChange={(e) => setVideoLink(e.target.value)}
      />

      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <textarea
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <button onClick={addVideo} disabled={uploading}>
        {uploading ? "Adding..." : "Add Video"}
      </button>

      {/* Existing Videos */}
      {photographerData?.portfolioVideos?.length > 0 && (
        <div style={{ marginTop: "2rem" }}>
          <h3 style={{ color: "#b3995e" }}>Existing Videos</h3>

          <div className="vp-portfolio-videos">
            {photographerData.portfolioVideos.map((vidObj) => {
              const embedUrl = getEmbedUrl(vidObj.videoLink);

              return (
                <div key={vidObj._id} className="vp-video-card">
                  {embedUrl ? (
                    <iframe src={embedUrl} title={vidObj.title} allowFullScreen></iframe>
                  ) : (
                    <video src={vidObj.videoLink} controls />
                  )}

                  <h4>{vidObj.title}</h4>
                  {vidObj.description && <p>{vidObj.description}</p>}

                  <button
                    onClick={() => setEditVideo(vidObj)}
                    style={{ marginRight: "0.5rem" }}
                  >
                    Edit
                  </button>

                  <button onClick={() => deleteVideo(vidObj._id)}>Delete</button>

                  {/* Edit Container */}
                  {editVideo?._id === vidObj._id && (
                    <div className="edit-container">
                      <input
                        type="text"
                        value={editVideo.videoLink}
                        onChange={(e) =>
                          setEditVideo({ ...editVideo, videoLink: e.target.value })
                        }
                      />
                      <input
                        type="text"
                        value={editVideo.title}
                        onChange={(e) =>
                          setEditVideo({ ...editVideo, title: e.target.value })
                        }
                      />
                      <textarea
                        value={editVideo.description}
                        onChange={(e) =>
                          setEditVideo({ ...editVideo, description: e.target.value })
                        }
                      />
                      <button
                        onClick={saveEdit}
                        disabled={uploading}
                        style={{ marginRight: "0.5rem" }}
                      >
                        Save
                      </button>
                      <button onClick={() => setEditVideo(null)}>Cancel</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioVideosPage;

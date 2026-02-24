import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Profile.css";
import defaultProfile from "../assets/default-profile-pic.png";
import logo from "../assets/logo.jpg";
import { Camera, Mail, Plus, ChevronLeft } from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const fileInputRef = useRef(null);

  // New mock fields for UI matching
  const [nickName, setNickName] = useState("");
  const [timeZone, setTimeZone] = useState("India Standard Time");
  
  // Email addition state
  const [secondaryEmails, setSecondaryEmails] = useState([]);
  const [isAddingEmail, setIsAddingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState("");

  const handleAddEmail = () => {
    if (newEmail.trim()) {
      setSecondaryEmails([...secondaryEmails, newEmail]);
      setNewEmail("");
      setIsAddingEmail(false);
    }
  };

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "",
    languages: [],
    country: "",
    latitude: "",
    longitude: "",
    profilePic: "", // URL or File
  });

  const OPENCAGE_API_KEY = import.meta.env.VITE_OPENCAGE_API_KEY;

  /* ---------------- FETCH USER ---------------- */
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
            setLoading(false);
            return; // Or navigate('/login')
        }

        if (token === "mock-creator-token") {
            const localUser = JSON.parse(localStorage.getItem("user"));
            if (localUser) {
                setUser(localUser);
                setFormData({
                    name: localUser.name || "",
                    email: localUser.email || "",
                    phone: localUser.phone || "",
                    gender: localUser.gender || "",
                    languages: localUser.languages || [],
                    country: localUser.country || "",
                    latitude: localUser.latitude || "",
                    longitude: localUser.longitude || "",
                    profilePic: localUser.profilePic || "",
                });
            }
            setLoading(false);
            return;
        }

        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/users/me`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) {
            throw new Error("Failed to fetch user");
        }

        const data = await res.json();
        setUser(data);

        setFormData({
            name: data.name || "",
            email: data.email || "",
            phone: data.phone || "",
            gender: data.gender || "",
            languages: data.languages || [],
            country: data.country || "",
            latitude: data?.location?.coordinates?.[1] || "",
            longitude: data?.location?.coordinates?.[0] || "",
            profilePic: data.profilePic || "",
        });
      } catch (err) {
        console.error(err);
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  /* ---------------- GEOLOCATION ---------------- */
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setFormData((prev) => ({
            ...prev,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          }));
        },
        (err) => console.error("Geolocation error:", err)
      );
    }
  }, []);

  /* ---------------- REVERSE GEOCODE ---------------- */
  useEffect(() => {
    const fetchCity = async () => {
      if (formData.latitude && formData.longitude) {
        try {
          const res = await axios.get(
            `https://api.opencagedata.com/geocode/v1/json?q=${formData.latitude}+${formData.longitude}&key=${OPENCAGE_API_KEY}`
          );

          const comp = res.data.results[0].components;
          setCity(comp.city || comp.town || comp.village || "");
        } catch (err) {
          console.error(err);
        }
      }
    };
    fetchCity();
  }, [formData.latitude, formData.longitude]);

  /* ---------------- HANDLERS ---------------- */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLanguageChange = (e) => {
    // For single select behavior as per new UI or keep array
    // Integrating simple select for now to match UI "Language" dropdown look
    const val = e.target.value;
    setFormData(prev => ({ ...prev, languages: [val] }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, profilePic: file }));
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current.click();
  };

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      
      if (token === "mock-creator-token") {
          // Simulate success for mock user
          // For file uploads in mock mode, we can't really persist them easily to localStorage
          // so we'll just mock it or keep the old one if it's a file, or create object URL
          let newProfilePic = user.profilePic;
          if (formData.profilePic instanceof File) {
             newProfilePic = URL.createObjectURL(formData.profilePic);
          } else if (formData.profilePic) {
             newProfilePic = formData.profilePic;
          }

          const updatedUser = { 
              ...user, 
              ...formData, 
              profilePic: newProfilePic 
          };
          
          setUser(updatedUser);
          localStorage.setItem("user", JSON.stringify(updatedUser));
          toast.success("Profile updated successfully!");
          if (updatedUser.role === "photographer") {
             navigate("/portfolio");
          } else {
             navigate("/");
          }
          return;
      }

      const form = new FormData();

      form.append("name", formData.name);
      form.append("phone", formData.phone);
      form.append("gender", formData.gender);
      form.append("country", formData.country);
      form.append("latitude", formData.latitude);
      form.append("longitude", formData.longitude);

      formData.languages.forEach((lang) => form.append("languages", lang));

      // Only send image if file selected
      if (formData.profilePic instanceof File) {
        form.append("profilePic", formData.profilePic);
      }

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/me`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      const data = await res.json();

      if (res.ok) {
        setUser(data);
        localStorage.setItem("user", JSON.stringify(data));
        toast.success("Profile updated successfully!");
        if (data.role === "photographer") {
           navigate("/portfolio");
        } else {
           navigate("/");
        }
      } else {
        toast.error(data.message || "Update failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error");
    }
  };

  if (loading) return <p style={{color:'white', padding:'2rem'}}>Loading...</p>;
  if (!user) return <div style={{color:'white', padding:'2rem', textAlign:'center'}}>
      <h2>Please log in to view your profile.</h2>
      <button onClick={() => navigate('/login')} className="continue-btn" style={{width:'auto', padding:'10px 20px', marginTop:'1rem'}}>Go to Login</button>
  </div>;

  // Determine if we should show border
  // Logic: "click add image from file they will make gold color disapper"
  // So if it's a File object (uploaded) OR a custom URL (not default), maybe remove gold?
  // User said "click add image from file", so specifically when a file is uploaded.
  const isCustomImage = formData.profilePic instanceof File || (formData.profilePic && formData.profilePic !== defaultProfile && formData.profilePic !== "");
  const imageClass = "preview-img";

  return (
    <div className="profile-page">
      {/* Top Header */}
      <div className="profile-title-header">
         <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
            <ChevronLeft size={30} style={{cursor:'pointer'}} onClick={() => navigate("/")} />
            <img src={logo} alt="Pixlo" className="profile-header-logo" />
            {/* <h2 style={{margin:0}}>PIXLO</h2> */}
         </div>
         <h2>Personal Information</h2>
         <div className="top-user-profile">
            <img 
               src={
                 formData.profilePic
                 ? (formData.profilePic instanceof File ? URL.createObjectURL(formData.profilePic) : formData.profilePic)
                 : defaultProfile
               } 
               alt="User" 
            />
         </div>
      </div>

      {/* Banner */}
      <div className="profile-banner"></div>

      <div className="profile-content-container">
        <form onSubmit={handleSubmit}>
          
          {/* Profile Header Section */}
          <div className="profile-header-section">
             <div className="profile-user-info">
                <div className="profile-pic-wrapper">
                   <img 
                     src={
                       formData.profilePic
                       ? (formData.profilePic instanceof File ? URL.createObjectURL(formData.profilePic) : formData.profilePic)
                       : defaultProfile
                     }
                     alt="Profile"
                     className={imageClass}
                   />
                </div>
                <div className="profile-text">
                   <h3>{formData.name || "User Name"}</h3>
                   <p>{formData.email || "user@example.com"}</p>
                   {/* Hidden File Input */}
                   <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleImageChange} 
                      style={{display:'none'}} 
                      accept="image/*"
                   />
                </div>
             </div>
             
             <button type="button" className="edit-btn" onClick={triggerFileUpload}>
                Edit
             </button>
          </div>

          {/* Form Grid */}
          <div className="form-grid">
             <div className="form-group">
                <label>Full Name</label>
                <input 
                   type="text" 
                   name="name" 
                   value={formData.name} 
                   onChange={handleChange} 
                   placeholder="Your First Name"
                />
             </div>

             <div className="form-group">
                <label>Nick Name</label>
                <input 
                   type="text" 
                   value={nickName} 
                   onChange={(e) => setNickName(e.target.value)}
                   placeholder="Your First Name"
                />
             </div>

             <div className="form-group">
                <label>Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange}>
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
             </div>

             <div className="form-group">
                <label>Country</label>
                <input 
                   type="text" 
                   name="country" 
                   value={formData.country} 
                   onChange={handleChange} 
                   placeholder="India"
                />
             </div>

             <div className="form-group">
                <label>Language</label>
                <select onChange={handleLanguageChange} value={formData.languages[0] || ""}>
                   <option value="">Select Language</option>
                   <option value="English">English</option>
                   <option value="Hindi">Hindi</option>
                   <option value="Spanish">Spanish</option>
                   <option value="French">French</option>
                </select>
             </div>

             <div className="form-group">
                <label>Time Zone</label>
                <select value={timeZone} onChange={(e)=>setTimeZone(e.target.value)}>
                   <option value="India Standard Time">India Standard Time</option>
                   <option value="GMT">Greenwich Mean Time</option>
                   <option value="EST">Eastern Standard Time</option>
                </select>
             </div>
          </div>

          {/* Email Section */}
             <div className="email-section">
             <label className="email-label">My email Address</label>
             <div className="email-card">
                <div className="email-icon-circle">
                   <Mail size={18} />
                </div>
                <div className="email-info">
                   <p>{formData.email}</p>
                   <span>1 month ago</span>
                </div>
             </div>

             {/* Secondary Emails */}
             {secondaryEmails.map((item, index) => (
                <div className="email-card" key={index}>
                   <div className="email-icon-circle">
                      <Mail size={18} />
                   </div>
                   <div className="email-info">
                      <p>{item}</p>
                      <span>Just added</span>
                   </div>
                </div>
             ))}

             {isAddingEmail ? (
                <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                   <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="Enter new email"
                      style={{
                         padding: '0.8rem 1rem',
                         borderRadius: '8px',
                         border: 'none',
                         outline: 'none',
                         flex: 1
                      }}
                   />
                   <button 
                      type="button" 
                      onClick={handleAddEmail} 
                      className="edit-btn"
                      style={{ padding: '0.8rem 1.5rem', fontSize: '0.9rem' }}
                   >
                      Add
                   </button>
                   <button 
                      type="button" 
                      onClick={() => setIsAddingEmail(false)} 
                      style={{ 
                         background: 'transparent', 
                         border: '1px solid #666', 
                         color: '#aaa', 
                         padding: '0.8rem 1.5rem', 
                         borderRadius: '8px',
                         cursor: 'pointer' 
                      }}
                   >
                      Cancel
                   </button>
                </div>
             ) : (
                <button type="button" className="add-email-btn" onClick={() => setIsAddingEmail(true)}>+Add Email Address</button>
             )}
          </div>

          {/* Submit Button */}
          <div className="continue-btn-container">
             <button type="submit" className="continue-btn">
               {user && user.role === 'photographer' ? 'Continue' : 'Save Update'}
             </button>
          </div>

        </form>

        <ToastContainer position="top-right" autoClose={3000} theme="dark" />
      </div>
    </div>
  );
};

export default Profile;

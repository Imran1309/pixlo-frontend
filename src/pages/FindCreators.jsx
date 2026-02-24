import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { MapPin, Calendar, Star, Filter, SlidersHorizontal, ChevronDown, ChevronUp, Search as SearchIcon } from "lucide-react"; 
import "./FindCreators.css";

const FindCreators = () => {
  const [photographers, setPhotographers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Filters UI State
  const [filtersOpen, setFiltersOpen] = useState({
      category: true,
      price: true,
      rating: true,
      gender: true
  });
  
  // Filters Selection State
  const [selectedFilters, setSelectedFilters] = useState({
     categories: [],
     priceRange: 20000,
     ratings: []
  });

  const toggleFilter = (section) => {
      setFiltersOpen(prev => ({...prev, [section]: !prev[section]}));
  };

  const handleCategoryChange = (e) => {
      const { value, checked } = e.target;
      setSelectedFilters(prev => {
          if (checked) return { ...prev, categories: [...prev.categories, value] };
          return { ...prev, categories: prev.categories.filter(c => c !== value) };
      });
  };

  const handleRatingChange = (star) => {
      setSelectedFilters(prev => {
          if (prev.ratings.includes(star)) {
              return { ...prev, ratings: prev.ratings.filter(r => r !== star) };
          }
          return { ...prev, ratings: [...prev.ratings, star] };
      });
  };

  const resetFilters = () => {
      setSelectedFilters({
          categories: [],
          priceRange: 20000,
          ratings: []
      });
  };

  // Read query params
  const queryParams = new URLSearchParams(location.search);
  const latParam = queryParams.get("lat");
  const lngParam = queryParams.get("lng");
  const cityParam = queryParams.get("city") || "Hyderabad";

  const [searchParams, setSearchParams] = useState({
      location: cityParam,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 86400000).toISOString().split('T')[0]
  });

  const handleSearch = async () => {
    if (!searchParams.location) return alert("Please enter a city");

    try {
      const geoRes = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${searchParams.location}`
      );
      const geoData = geoRes.data;

      if (!geoData || geoData.length === 0) return alert("City not found");

      const { lat, lon } = geoData[0];
      // Navigate with new params (re-triggers fetch)
      navigate(`/creators?lat=${lat}&lng=${lon}&city=${encodeURIComponent(searchParams.location)}&start=${searchParams.startDate}&end=${searchParams.endDate}`);
    } catch (err) {
      console.error(err);
      alert("Error searching location");
    }
  };

  useEffect(() => {
    // ... existing fetch logic ...
    // Note: In a real app, you would include selectedFilters in the API call deps or filtering logic here.
    const fetchPhotographers = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL;
        let url = `${API_URL}/api/photographers/`;

        if (latParam && lngParam) {
          url = `${API_URL}/api/photographers/nearby?lat=${latParam}&lng=${lngParam}`;
        }

        const res = await axios.get(url);
        setPhotographers(res.data.photographers || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPhotographers();
  }, [latParam, lngParam]); // Add selectedFilters here if we were doing real filtering

  if (loading) return <div className="creators-page loading-screen"><div className="spinner"></div></div>;

  const categoriesList = ["Wedding photography", "Portrait sessions", "Product photography", "Event videography", "Social media reels"];

  const clearSearchAndFilters = () => {
      resetFilters();
      setSearchParams(prev => ({ ...prev, location: "" }));
      navigate("/creators");
  };

  const filteredPhotographers = photographers.filter(p => {
      if (selectedFilters.categories.length > 0) {
          const hasCategory = selectedFilters.categories.some(cat => 
              (p.specialization && p.specialization.includes(cat)) ||
              (p.services && p.services.some(s => s.serviceName.toLowerCase().includes(cat.toLowerCase())))
          );
          if (!hasCategory) return false;
      }
      if (selectedFilters.priceRange && (p.startingPrice || 2000) > selectedFilters.priceRange) {
          return false;
      }
      if (selectedFilters.ratings.length > 0) {
          const ratingFloor = Math.round(p.rating || 5);
          if (!selectedFilters.ratings.includes(ratingFloor)) return false;
      }
      return true;
  });

  return (
    <div className="creators-page">
      {/* Top Search Bar */}
      <div className="search-filter-bar">
         <div className="search-pill">
             <div className="search-item location">
                 <MapPin size={18} className="icon-grey"/>
                 <input 
                    type="text" 
                    value={searchParams.location}
                    onChange={(e) => setSearchParams({...searchParams, location: e.target.value})}
                    placeholder="Location"
                 />
             </div>
             <div className="divider"></div>
             <div className="search-item date">
                 <Calendar size={18} className="icon-grey"/>
                 <input 
                    type="date" 
                    value={searchParams.startDate}
                    onChange={(e) => setSearchParams({...searchParams, startDate: e.target.value})}
                 />
             </div>
             <div className="divider"></div>
             <div className="search-item date">
                 <Calendar size={18} className="icon-grey"/>
                 <input 
                    type="date" 
                    value={searchParams.endDate}
                    onChange={(e) => setSearchParams({...searchParams, endDate: e.target.value})}
                 />
             </div>
             <button className="search-again-btn" onClick={handleSearch}>
                 Search Again
             </button>
         </div>
      </div>

      <div className="creators-layout">
         {/* Sidebar */}
         <aside className="filters-sidebar">
             <div className="sidebar-header">
                 <h3>Filters</h3>
                 <SlidersHorizontal size={18} />
             </div>
             
             {/* Category Filter */}
             <div className="filter-section">
                <div className="filter-title" onClick={() => toggleFilter('category')}>
                    <span>Category</span>
                    {filtersOpen.category ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                </div>
                {filtersOpen.category && (
                    <div className="filter-options">
                        {categoriesList.map(cat => (
                            <label key={cat} className="checkbox-label">
                                <input 
                                    type="checkbox" 
                                    value={cat}
                                    checked={selectedFilters.categories.includes(cat)}
                                    onChange={handleCategoryChange}
                                /> 
                                {cat}
                            </label>
                        ))}
                    </div>
                )}
             </div>

             {/* Price Filter */}
             <div className="filter-section">
                <div className="filter-title" onClick={() => toggleFilter('price')}>
                    <span>Price</span>
                    {filtersOpen.price ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                </div>
                {filtersOpen.price && (
                    <div className="filter-options price-slider-container">
                        <input 
                            type="range" 
                            min="1000" 
                            max="20000" 
                            className="price-slider"
                            value={selectedFilters.priceRange}
                            onChange={(e) => setSelectedFilters({...selectedFilters, priceRange: e.target.value})}
                        />
                        <div className="price-labels">
                           <span>₹1000</span>
                           <span>₹{selectedFilters.priceRange}</span>
                        </div>
                    </div>
                )}
             </div>

             {/* Rating Filter */}
             <div className="filter-section">
                <div className="filter-title" onClick={() => toggleFilter('rating')}>
                    <span>Rating</span>
                    {filtersOpen.rating ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                </div>
                {filtersOpen.rating && (
                    <div className="filter-options">
                        {[5,4,3,2,1].map(star => (
                            <label key={star} className="checkbox-label">
                                <input 
                                    type="checkbox" 
                                    checked={selectedFilters.ratings.includes(star)}
                                    onChange={() => handleRatingChange(star)}
                                /> 
                                {star} STAR <Star size={12} fill="#ffaa00" stroke="none" style={{marginLeft:'4px'}}/>
                            </label>
                        ))}
                    </div>
                )}
             </div>
             
             <div className="filter-actions">
                 <button className="apply-btn">Apply Filter</button>
                 <span className="reset-link" onClick={resetFilters}>Reset all</span>
             </div>
         </aside>

         {/* Content Grid */}
         <main className="creators-content">
             
             <div className="creators-grid-new">
                 {filteredPhotographers.length === 0 && (
                     <div className="no-results-box">
                         <h3>No results? Try expanding your search</h3>
                         <div className="no-results-actions">
                             <button onClick={clearSearchAndFilters}>Remove filters</button>
                             <button onClick={clearSearchAndFilters}>Expand distance</button>
                             <button onClick={clearSearchAndFilters}>All categories</button>
                         </div>
                     </div>
                 )}

                 {filteredPhotographers.map((p) => (
                    <div key={p._id} className="creator-card-new">
                        <div className="card-image-box">
                            <img 
                                src={
                                    (p.portfolioImages && p.portfolioImages.length > 0) ? p.portfolioImages[0] : 
                                    (p.userId?.profilePic && p.userId.profilePic && !p.userId.profilePic.endsWith('/uploads/') && p.userId.profilePic !== "") 
                                        ? p.userId.profilePic 
                                        : "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=300&q=80"
                                } 
                                alt={p.userId?.name || "Creator"} 
                                onError={(e) => { e.target.onError = null; e.target.src = "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=300&q=80"; }}
                            />
                        </div>
                        <div className="card-details">
                            <div className="card-header-row">
                                <h3>{p.userId?.name || "Creator"}</h3>
                                <div className="card-rating">
                                    <Star size={14} fill="#ffaa00" stroke="none"/>
                                    <span>{p.rating || "4.9(24)"}</span>
                                </div>
                            </div>
                            <p className="card-subtitle">{p.specialty || "Portrait & wedding specialist"}</p>
                            
                            <div className="card-meta">
                              <MapPin size={14}/>
                              <span>2.4 km from you</span>
                            </div>

                            <div className="card-tags">
                                <span className="tag">wedding photography</span>
                                <span className="tag">Portrait sessions</span>
                            </div>
                            
                            <div className="card-footer-row">
                                <span className="price-tag">FROM ₹{p.startingPrice || "2000"}/hr</span>
                                <button className="view-profile-btn" onClick={() => navigate(`/photographer/${p._id}`)}>
                                    VIEW PROFILE
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
             </div>
             
             {filteredPhotographers.length > 0 && (
                 <div className="load-more-container">
                     <button className="load-more-btn">LOAD MORE</button>
                 </div>
             )}
         </main>
      </div>
    </div>
  );
};

export default FindCreators;

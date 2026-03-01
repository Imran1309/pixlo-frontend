import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { MapPin, Calendar, Star, SlidersHorizontal, ChevronDown, ChevronUp, Navigation } from "lucide-react";
import "./FindCreators.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Haversine formula for distance between two lat/lng points (returns km)
function haversineDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10; // rounded to 1 decimal
}

const FindCreators = () => {
    const [photographers, setPhotographers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userLocation, setUserLocation] = useState(null); // { lat, lng }
    const [locationError, setLocationError] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    // Filters UI State
    const [filtersOpen, setFiltersOpen] = useState({
        category: true,
        price: true,
        rating: true,
    });

    // Filters Selection State
    const [selectedFilters, setSelectedFilters] = useState({
        categories: [],
        priceRange: 20000,
        ratings: [],
    });

    const toggleFilter = (section) => {
        setFiltersOpen((prev) => ({ ...prev, [section]: !prev[section] }));
    };

    const handleCategoryChange = (e) => {
        const { value, checked } = e.target;
        setSelectedFilters((prev) => {
            if (checked) return { ...prev, categories: [...prev.categories, value] };
            return { ...prev, categories: prev.categories.filter((c) => c !== value) };
        });
    };

    const handleRatingChange = (star) => {
        setSelectedFilters((prev) => {
            if (prev.ratings.includes(star)) {
                return { ...prev, ratings: prev.ratings.filter((r) => r !== star) };
            }
            return { ...prev, ratings: [...prev.ratings, star] };
        });
    };

    const resetFilters = () => {
        setSelectedFilters({ categories: [], priceRange: 20000, ratings: [] });
    };

    // Read query params
    const queryParams = new URLSearchParams(location.search);
    const latParam = queryParams.get("lat");
    const lngParam = queryParams.get("lng");
    const cityParam = queryParams.get("city") || "";

    const [searchParams, setSearchParams] = useState({
        location: cityParam,
        startDate: new Date().toISOString().split("T")[0],
        endDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    });

    const handleSearch = async () => {
        if (!searchParams.location) return alert("Please enter a city");

        try {
            const geoRes = await axios.get(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchParams.location)}&limit=1`,
                { headers: { "User-Agent": "Pixlo App" } }
            );

            if (!geoRes.data || geoRes.data.length === 0) return alert("City not found");

            const { lat, lon } = geoRes.data[0];
            navigate(
                `/creators?lat=${lat}&lng=${lon}&city=${encodeURIComponent(searchParams.location)}&start=${searchParams.startDate}&end=${searchParams.endDate}`
            );
        } catch (err) {
            console.error(err);
            alert("Error searching location");
        }
    };

    // Auto-detect user location on mount or fallback to profile
    useEffect(() => {
        const fallbackToProfile = () => {
            const storedUser = JSON.parse(localStorage.getItem("user"));
            if (storedUser && storedUser.latitude && storedUser.longitude) {
                setUserLocation({ lat: Number(storedUser.latitude), lng: Number(storedUser.longitude) });
                setLocationError(null);
            } else {
                setLocationError("Location access denied. Please update your City in Profile.");
            }
        };

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                },
                (err) => {
                    console.warn("Geolocation denied:", err.message);
                    fallbackToProfile();
                }
            );
        } else {
            fallbackToProfile();
        }
    }, []);

    useEffect(() => {
        const fetchPhotographers = async () => {
            try {
                setLoading(true);
                let url = `${API_URL}/api/photographers/`;

                // Use URL params if present (from search), otherwise use auto-detected location
                const useLat = latParam || (userLocation ? userLocation.lat : null);
                const useLng = lngParam || (userLocation ? userLocation.lng : null);

                if (useLat && useLng) {
                    url = `${API_URL}/api/photographers/nearby?lat=${useLat}&lng=${useLng}&distance=100000`;
                }

                const res = await axios.get(url);
                const rawPhotographers = res.data.photographers || [];

                // If we have user location and backend didn't return distanceKm, compute with Haversine
                const enriched = rawPhotographers.map((p) => {
                    if (p.distanceKm !== undefined) return p; // Already computed by backend $geoNear

                    const pLng = p.location?.coordinates?.[0];
                    const pLat = p.location?.coordinates?.[1];

                    if (useLat && useLng && pLat && pLng) {
                        return {
                            ...p,
                            distanceKm: haversineDistance(parseFloat(useLat), parseFloat(useLng), pLat, pLng),
                        };
                    }
                    return p;
                });

                // Sort by distance if available
                enriched.sort((a, b) => {
                    if (a.distanceKm !== undefined && b.distanceKm !== undefined) {
                        return a.distanceKm - b.distanceKm;
                    }
                    return 0;
                });

                setPhotographers(enriched);
            } catch (err) {
                console.error("Error fetching photographers:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchPhotographers();
    }, [latParam, lngParam, userLocation]);

    const categoriesList = [
        "Wedding photography",
        "Portrait sessions",
        "Product photography",
        "Event videography",
        "Social media reels",
    ];

    const clearSearchAndFilters = () => {
        resetFilters();
        setSearchParams((prev) => ({ ...prev, location: "" }));
        navigate("/creators");
    };

    const filteredPhotographers = photographers.filter((p) => {
        if (selectedFilters.categories.length > 0) {
            const hasCategory = selectedFilters.categories.some(
                (cat) =>
                    (p.specialization && p.specialization.includes(cat)) ||
                    (p.services && p.services.some((s) => s.serviceName?.toLowerCase().includes(cat.toLowerCase())))
            );
            if (!hasCategory) return false;
        }
        if (selectedFilters.priceRange && (p.startingPrice || 0) > selectedFilters.priceRange) {
            return false;
        }
        if (selectedFilters.ratings.length > 0) {
            const ratingFloor = Math.round(p.rating || 5);
            if (!selectedFilters.ratings.includes(ratingFloor)) return false;
        }
        return true;
    });

    if (loading) {
        return (
            <div className="creators-page loading-screen">
                <div className="spinner"></div>
                <p style={{ color: "#fff", marginTop: "1rem" }}>Finding photographers near you...</p>
            </div>
        );
    }

    return (
        <div className="creators-page">
            {/* Top Search Bar */}
            <div className="search-filter-bar">
                <div className="search-pill">
                    <div className="search-item location">
                        <MapPin size={18} className="icon-grey" />
                        <input
                            type="text"
                            value={searchParams.location}
                            onChange={(e) => setSearchParams({ ...searchParams, location: e.target.value })}
                            placeholder="Enter city (e.g. Hyderabad)"
                            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        />
                    </div>
                    <div className="divider"></div>
                    <div className="search-item date">
                        <Calendar size={18} className="icon-grey" />
                        <input
                            type="date"
                            value={searchParams.startDate}
                            onChange={(e) => setSearchParams({ ...searchParams, startDate: e.target.value })}
                        />
                    </div>
                    <div className="divider"></div>
                    <div className="search-item date">
                        <Calendar size={18} className="icon-grey" />
                        <input
                            type="date"
                            value={searchParams.endDate}
                            onChange={(e) => setSearchParams({ ...searchParams, endDate: e.target.value })}
                        />
                    </div>
                    <button className="search-again-btn" onClick={handleSearch}>
                        Search
                    </button>
                </div>
                {userLocation && (
                    <div style={{ textAlign: "center", color: "#cba84a", fontSize: "0.8rem", marginTop: "0.5rem" }}>
                        <Navigation size={12} style={{ marginRight: 4 }} />
                        Showing photographers near your location
                    </div>
                )}
                {locationError && !latParam && (
                    <div style={{ textAlign: "center", color: "#888", fontSize: "0.8rem", marginTop: "0.5rem" }}>
                        {locationError} — search by city above
                    </div>
                )}
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
                        <div className="filter-title" onClick={() => toggleFilter("category")}>
                            <span>Category</span>
                            {filtersOpen.category ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </div>
                        {filtersOpen.category && (
                            <div className="filter-options">
                                {categoriesList.map((cat) => (
                                    <label key={cat} className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            value={cat}
                                            checked={selectedFilters.categories.includes(cat)}
                                            onChange={handleCategoryChange}
                                        />{" "}
                                        {cat}
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Price Filter */}
                    <div className="filter-section">
                        <div className="filter-title" onClick={() => toggleFilter("price")}>
                            <span>Price</span>
                            {filtersOpen.price ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </div>
                        {filtersOpen.price && (
                            <div className="filter-options price-slider-container">
                                <input
                                    type="range"
                                    min="1000"
                                    max="20000"
                                    className="price-slider"
                                    value={selectedFilters.priceRange}
                                    onChange={(e) =>
                                        setSelectedFilters({ ...selectedFilters, priceRange: e.target.value })
                                    }
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
                        <div className="filter-title" onClick={() => toggleFilter("rating")}>
                            <span>Rating</span>
                            {filtersOpen.rating ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </div>
                        {filtersOpen.rating && (
                            <div className="filter-options">
                                {[5, 4, 3, 2, 1].map((star) => (
                                    <label key={star} className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={selectedFilters.ratings.includes(star)}
                                            onChange={() => handleRatingChange(star)}
                                        />{" "}
                                        {star} STAR{" "}
                                        <Star size={12} fill="#ffaa00" stroke="none" style={{ marginLeft: "4px" }} />
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="filter-actions">
                        <button className="apply-btn">Apply Filter</button>
                        <span className="reset-link" onClick={resetFilters}>
                            Reset all
                        </span>
                    </div>
                </aside>

                {/* Content Grid */}
                <main className="creators-content">
                    <div className="creators-grid-new">
                        {filteredPhotographers.length === 0 && (
                            <div className="no-results-box">
                                <h3>No photographers found near you</h3>
                                <p style={{ color: "#aaa", marginTop: "0.5rem" }}>
                                    Try expanding your search area or removing filters
                                </p>
                                <div className="no-results-actions">
                                    <button onClick={clearSearchAndFilters}>Remove filters</button>
                                    <button onClick={() => navigate("/creators?distance=200000")}>
                                        Expand distance
                                    </button>
                                </div>
                            </div>
                        )}

                        {filteredPhotographers.map((p) => {
                            const profileImg =
                                p.portfolioImages && p.portfolioImages.length > 0
                                    ? p.portfolioImages[0].url || p.portfolioImages[0]
                                    : p.userId?.profilePic && p.userId.profilePic !== ""
                                        ? p.userId.profilePic
                                        : "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=300&q=80";

                            const distanceLabel =
                                p.distanceKm !== undefined
                                    ? `${p.distanceKm} km from you`
                                    : "Distance unknown";

                            const specialties =
                                p.specialization && p.specialization.length > 0
                                    ? p.specialization.slice(0, 2).join(" & ")
                                    : p.typeOfWork || "Photography";

                            return (
                                <div key={p._id} className="creator-card-new">
                                    <div className="card-image-box">
                                        <img
                                            src={profileImg}
                                            alt={p.userId?.name || "Creator"}
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src =
                                                    "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=300&q=80";
                                            }}
                                        />
                                    </div>
                                    <div className="card-details">
                                        <div className="card-header-row">
                                            <h3>{p.userId?.name || "Creator"}</h3>
                                            <div className="card-rating">
                                                <Star size={14} fill="#ffaa00" stroke="none" />
                                                <span>
                                                    {p.rating ? parseFloat(p.rating).toFixed(1) : "New"}
                                                    {p.reviewCount > 0 ? ` (${p.reviewCount})` : ""}
                                                </span>
                                            </div>
                                        </div>
                                        <p className="card-subtitle">{specialties}</p>

                                        <div className="card-meta">
                                            <MapPin size={14} />
                                            <span>{distanceLabel}</span>
                                        </div>

                                        <div className="card-tags">
                                            {p.specialization && p.specialization.slice(0, 2).map((s) => (
                                                <span key={s} className="tag">{s}</span>
                                            ))}
                                            {(!p.specialization || p.specialization.length === 0) && (
                                                <span className="tag">{p.typeOfWork || "Photography"}</span>
                                            )}
                                        </div>

                                        <div className="card-footer-row">
                                            <span className="price-tag">
                                                FROM ₹{p.startingPrice || (p.services?.[0]?.priceINR) || "Contact"}/hr
                                            </span>
                                            <button
                                                className="view-profile-btn"
                                                onClick={() => navigate(`/photographer/${p._id}`)}
                                            >
                                                VIEW PROFILE
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
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

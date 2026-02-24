import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Home from "./Home"; // adjust path if needed
import Login from "./auth/Login";
import Signup from "./auth/Signup";
import CreatorLogin from "./auth/CreatorLogin";
import CreatorSignup from "./auth/CreatorSignup";
import ForgotPassword from "./auth/ForgotPassword";
import Profile from "./pages/Profile";
import Navbar from "./Navbar"; // create this component
import PhotographerPortfolio from "./pages/PhotographerPortfolio"; // Updated path to pages
import PhotographerServices from "./pages/PhotographerServices"; // New page
import PortfolioMedia from "./pages/PortfolioMedia"; // New Page
import PhotographerAvailability from "./pages/PhotographerAvailability"; // New Page
import ViewServices from "./pages/ViewServices";
import FindCreators from "./pages/FindCreators";
import ViewProfile from "./pages/ViewProfile";
import BookingPage from "./components/BookingPage";
import UserBookings from "./components/UserBookings";
import PhotographerBookings from "./components/PhotographerBookings";
import RateReview from "./components/RateReview";
import PhotographerReviews from "./pages/PhotographerReviews";
import ResetPassword from "./auth/ResetPassword";

// Wrapper to conditionally show Navbar
const AppWrapper = () => {
  const location = useLocation();
  const hideNavbarRoutes = ["/", "/login", "/signup", "/forgot-password", "/creator-login", "/creator-signup", "/personal-information", "/service-details", "/profile", "/portfolio", "/portfolio/services", "/portfolio/media"];
  const showNavbar = !hideNavbarRoutes.includes(location.pathname);

  return (
    <>
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/creator-login" element={<CreatorLogin />} />
        <Route path="/creator-signup" element={<CreatorSignup />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/portfolio" element={<PhotographerPortfolio />} />
        <Route path="/portfolio/media" element={<PortfolioMedia />} />
        <Route path="/portfolio/services" element={<PhotographerServices />} />
        <Route path="/portfolio/availability" element={<PhotographerAvailability />} />
        <Route path="/creators" element={<FindCreators />} /> 
        <Route path="/services/:id" element={<ViewServices />} /> 
        <Route path="/photographer/:userId" element={<ViewProfile />} />
        <Route path="/my-bookings" element={<UserBookings />} />
        <Route path="/book/:photographerId/:serviceId" element={<BookingPage />} /> 
        <Route path="/bookings" element={<PhotographerBookings />} />
        <Route path="/rate/:bookingId" element={<RateReview />} />
        <Route path="/photographer/:photographerId/reviews" element={<PhotographerReviews />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Add future routes here */}
        {/* <Route path="/about" element={<About />} /> */}
        {/* <Route path="/contact" element={<Contact />} /> */}
      </Routes>
    </>
  );
};

const App = () => {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
};

export default App;

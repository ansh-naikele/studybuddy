import React from 'react'; // Import React to use JSX and React features
import './navbar.css'; // Import the CSS file to style the navbar
import logo from './static/logo.png'; // Import the logo image for the navbar
import { useNavigate, Link, useLocation } from 'react-router-dom'; // Import Link from react-router-dom for navigation

// Define the Navbar component
const Navbar = () => {

    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
      // Remove the token from localStorage
      localStorage.removeItem("token");
      // Optionally, redirect the user to the login page
      navigate('/login');
    };

  // Check if the user is on login or signup pages
  const isAuthPage = location.pathname === '/' || location.pathname === '/login' || location.pathname === '/register';

  return (
    <nav className="navbar">
      {/* Logo section */}
      <div className="navbar-logo">
        <img src={logo} alt="StudyBuddy Logo" />
      </div>

      {/* Links section */}
      <div className="navbar-links">
        {/* Show Login and Sign Up buttons only on login or signup pages */}
        {isAuthPage ? (
          <>
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/register" className="nav-link">Sign up</Link>
          </>
        ) : (
          <>
            {/* Show other links only when not on login or signup pages */}
            <Link to="/dashboard" className="nav-link">Dashboard</Link>
            <Link to="/schedule" className="nav-link">Schedule</Link>
            <Link to="/flashcards" className="nav-link">Flashcards</Link>
            <Link to="/chatbot" className="nav-link">Chatbot</Link>
            <button className="nav-link logout-button" onClick={handleLogout}>
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

// Export the Navbar component so it can be used in other parts of the application
export default Navbar;

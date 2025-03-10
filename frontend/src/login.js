import React from 'react';
import { useState } from 'react'; // Importing useState hook for managing component state
import { useNavigate } from 'react-router-dom'; // Importing useNavigate hook for navigation
import './login.css'; // Importing the CSS file for styling the login component
import logo from './static/logo.png'; // Importing the logo image
import Navbar from './navbar'; // Importing Navbar component

// Define the Login component
const Login = () => {
  // useNavigate hook to allow redirection after successful login
  const navigate = useNavigate();

  // Define state variables for email and password input fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Function to handle the login process
  async function loginUser(event) {
    event.preventDefault(); // Prevent page refresh on form submit

    // Send login details to the server using the Fetch API
    const response = await fetch('http://localhost:1337/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', // Set content type to JSON
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json(); // Parse the response data as JSON

    // If login is successful, store the token and user type in local storage
    if (data.status === 'ok') {
      localStorage.setItem('token', data.user);
      localStorage.setItem('userType', data.tutor ? 'tutor' : 'tutoree'); // Store user type based on the response
      navigate('/dashboard'); // Redirect the user to the schedule page
    } else {
      // Display an alert if there is an error during login
      alert(data);
    }
  }

  return (
    <>
      {/* Include the Navbar component at the top of the page */}
      <Navbar />

      {/* Main container for the login form */}
      <div className="login-container">
        <div className="login-box">
          {/* Header section with logo and welcome text */}
          <div className="login-header">
            <img src={logo} alt="StudyBuddy Logo" className="logo" /> {/* Logo image */}
            <h2>Welcome to StudyBuddy</h2> {/* Heading for the login page */}
          </div>

          {/* Login form */}
          <form onSubmit={loginUser}> {/* Attach the loginUser function to the form's onSubmit event */}
            {/* Input group for the email */}
            <div className="input-group">
              <label htmlFor="email">Email</label> {/* Label for email input */}
              <input 
                type="email" 
                id="email" 
                name="email" 
                placeholder="Enter your email" 
                value={email} // Bind the email state to the input field
                onChange={(e) => setEmail(e.target.value)} // Update state on input change
                required 
              />
            </div>

            {/* Input group for the password */}
            <div className="input-group">
              <label htmlFor="password">Password</label> {/* Label for password input */}
              <input 
                type="password" 
                id="password" 
                name="password" 
                placeholder="Enter your password" 
                value={password} // Bind the password state to the input field
                onChange={(e) => setPassword(e.target.value)} // Update state on input change
                required 
              />
            </div>

            {/* Login button */}
            <button type="submit" className="login-button">Log In</button> {/* The form submission triggers loginUser */}
          </form>

          {/* Footer section with links to "Forgot password?" and "Create an account" */}
          <div className="login-footer">
            <a href="/register">Create an account</a> {/* Link to create a new account */}
          </div>
        </div>
      </div>
    </>
  );
};

// Export the Login component so it can be used in other parts of the application
export default Login;

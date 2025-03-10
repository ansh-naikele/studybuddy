import React from 'react';
import { useState } from 'react'; // Importing useState hook to manage the component's state
import { useNavigate } from 'react-router-dom'; // Importing useNavigate hook for navigation
import './register.css'; // Importing the CSS for styling
import Navbar from './navbar'; // Importing Navbar component to include it in the page
import logo from './static/logo.png'; // Importing the logo image

// Define the Register component
const Register = () => {
    const navigate = useNavigate(); // useNavigate hook for programmatic navigation

    // Define state variables for the form fields
    const [name, setName] = useState(''); // State for storing the user's name
    const [email, setEmail] = useState(''); // State for storing the user's email
    const [password, setPassword] = useState(''); // State for storing the user's password
    const [role, setRole] = useState('tutoree'); // State for storing the user's role, default to 'tutoree'

    // Function to handle user registration
    async function registerUser(event) {
        event.preventDefault(); // Prevent the default form submission behavior (i.e., page refresh)

        // Make a POST request to the registration endpoint
        const response = await fetch('http://localhost:1337/api/register', {
            method: 'POST', // HTTP method
            headers: {
                'Content-Type': 'application/json' // Specifying the content type of the request body
            },
            body: JSON.stringify({
                name,
                email,
                password,
                role
            }) // Sending the user's name, email, password, and role in the request body
        });

        const data = await response.json(); // Parse the response data

        // Check if the registration was successful
        if (data.status === 'ok') {
            // Alert the user of successful registration
            alert('Registration successful! Please log in.');
            // Redirect to login page after successful registration
            navigate('/login');
        } else {
            // Display an error message if registration fails
            alert(data.error || 'Registration failed');
        }
    }

    return (
        <>
            {/* Include the Navbar component at the top of the page */}
            <Navbar />

            {/* Main container for the registration form */}
            <div className="register-container">
                <div className="register-box">
                    {/* Header section with logo and title */}
                    <div className="register-header">
                        <img src={logo} alt="StudyBuddy Logo" className="logo" /> {/* Logo image */}
                        <h2>Sign Up for StudyBuddy</h2> {/* Heading for the registration page */}
                    </div>

                    {/* Registration form */}
                    <form onSubmit={registerUser}>
                        {/* Input group for the full name */}
                        <div className="input-group">
                            <label htmlFor="name">Full Name</label> {/* Label for full name input */}
                            <input 
                                type="text" 
                                id="name" 
                                name="name" 
                                placeholder="Enter your full name" 
                                value={name} // Bind the name state to the input field
                                onChange={(e) => setName(e.target.value)} // Update state on input change
                                required 
                            />
                        </div>

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

                        {/* Input group for selecting the user's role */}
                        <div className="input-group">
                            <label htmlFor="role">Select Role</label> {/* Label for role selection */}
                            <select 
                                id="role" 
                                name="role" 
                                value={role} // Bind the role state to the select field
                                onChange={(e) => setRole(e.target.value)} // Update state on selection change
                                required
                            >
                                <option value="tutoree">Tutoree</option> {/* Default role */}
                                <option value="tutor">Tutor</option> {/* Option to select tutor role */}
                            </select>
                        </div>

                        {/* Sign-up button */}
                        <button type="submit" className="register-button">Sign Up</button> {/* Form submission button */}
                    </form>

                    {/* Footer section with a link to the login page if the user already has an account */}
                    <div className="register-footer">
                        <p>Already have an account? <a href="/login">Log in</a></p> {/* Link to login page */}
                    </div>
                </div>
            </div>
        </>
    );
};

// Export the Register component to be used in other parts of the application
export default Register;

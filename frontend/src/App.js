import React from 'react';
import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './login';
import Navbar from './navbar.js';
import ScheduleTutor from './scheduleTutor.js';
import ScheduleTutoree from './scheduleTutoree.js';
import Register from './register.js';
import Dashboard from './dashboard.js';
import Flashcards  from './flashcards.js';
import Chatbot from './chatbot.js';
// The main App component that handles the routing and overall structure of the application

const ScheduleWrapper = () => {
    const [userType, setUserType] = useState(() => {
      // Initialize from localStorage if available
      return localStorage.getItem('userType') || null;
    });
  
    useEffect(() => {
      const fetchUserType = async () => {
        try {
          const response = await fetch('/api/userType', {
            method: 'GET',
            headers: {
              'x-access-token': localStorage.getItem('token'),
            },
          });
  
          if (!response.ok) {
            throw new Error('Failed to fetch user type');
          }
  
          const result = await response.json();
          const type = result.tutor ? 'tutor' : 'tutoree';
          setUserType(type);
          // Store in localStorage
          localStorage.setItem('userType', type);
        } catch (error) {
          console.error('Error fetching user type:', error);
        }
      };
  
      fetchUserType();
    }, []);
  
    // Show loading state while fetching user type
    if (!userType) {
      return <div>Loading...</div>;
    }
  
    // Render appropriate component based on user type
    return userType === 'tutor' ? <ScheduleTutor /> : <ScheduleTutoree />;
  };

const App = () => {
  return (
    <Router> {/* Wraps the entire app in a Router to enable routing functionality */}
        <div>
          <Navbar />
          <Routes>
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Register />} />
            <Route path="/schedule" element={<ScheduleWrapper />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/flashcards" element={<Flashcards />} />
            <Route path="/chatbot" element={<Chatbot />} />
            {/* Define additional pages here */}
          </Routes>
        </div>
    </Router>
  );
};

export default App;
import React, { useEffect, useState } from 'react'; // Import React library
import './dashboard.css'; // Import custom CSS for styling
import { FiCalendar, FiVideo } from 'react-icons/fi'; // Import icons
import { useNavigate } from 'react-router-dom';

// Dashboard component receives userName and upcomingSessions as props
const Dashboard = () => {
    const [userName, setUserName] = useState(''); // State to store user's name
    const [upcomingSessions, setUpcomingSessions] = useState([]); // State to store sessions
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
              navigate('/login'); // Redirect to login if no token
              return;
            }
      
            try {
              const response = await fetch('http://localhost:1337/api/bookings', {
                headers: {
                  'Content-Type': 'application/json',
                  'x-access-token': localStorage.getItem("token")
                },
              });

              const data = await response.json();
              console.log(data);
              if (data.status === 'ok') {
                setUserName(data.name); // Set user's name
                setUpcomingSessions(data.bookings); // Set user's bookings
              } else {
                console.error(data.error); // Handle errors (e.g., token issues)
                navigate('/login');
              }
            } catch (error) {
              console.error('Error fetching data:', error);
              navigate('/login');
            }
        };
      
        fetchData();
    }, [navigate]);

    const formatDay = (dayIndex) => {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        return days[dayIndex] || 'Unknown';
    };

    const formatTime = (timeIndex) => {
        const hours = 7 + timeIndex; // Adjust time index (assuming 7 AM is index 0)
        const minutes = '00';
        return `${hours}:${minutes}`;
    };

    const handleJoinSession = (sessionLink) => {
        // Logic to handle the "Join Session" button click
        console.log('Joining session link:', sessionLink);
        // Redirect to the session link
        window.open(sessionLink, '_blank'); // Redirects to the session URL or link
    };

    return (
        <div className="dashboard-container">
            {/* Display a welcome message with the user's name */}
            <h2 className="welcome-message">Welcome to StudyBuddy, {userName}</h2>

            {/* Container for displaying upcoming sessions */}
            <div className="upcoming-sessions-container">
                <div className="upcoming-header">
                    <FiCalendar size={20} /> {/* Calendar icon */}
                    <h3>Upcoming Sessions</h3>
                </div>

                {/* List of upcoming sessions */}
                <div className="sessions-list">
                    {upcomingSessions.map((session, index) => {
                        console.log(session);
                        return(
                        <div key={index} className="session-card">
                            <h4>Session with {session.name}</h4> {/* Display tutor's name */}
                            <p>{formatDay(session.day)} at {formatTime(session.time)}</p> {/* Display day and time */}
                            <button 
                                className="join-button"
                                onClick={() => handleJoinSession(session.link)} // Handle join session button click, passing the session link
                            >
                                <FiVideo size={18} /> {/* Video icon */}
                                Join Session
                            </button>
                        </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
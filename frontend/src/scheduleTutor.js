import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './scheduleTutor.css';

const ScheduleTutor = () => {
    const navigate = useNavigate();

    useEffect(() => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login"); // Redirect to login if no token
      }
    }, [navigate]);

  const [availability, setAvailability] = useState(Array(7).fill(Array(19).fill(false)));

  // Function to toggle the availability of a specific time slot
  const toggleTimeSlot = (dayIndex, timeIndex) => {
    // Update the availability based on the selected day and time slot
    const updatedAvailability = availability.map((day, index) =>
      index === dayIndex ? day.map((slot, i) => (i === timeIndex ? !slot : slot)) : day
    );
    // Set the updated availability
    setAvailability(updatedAvailability);
  };

  const saveAvailability = async () => {
    try {
      const response = await fetch('/api/saveAvailability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': localStorage.getItem("token")
        },
        body: JSON.stringify({ availability }),
      });

      const data = await response.json();
      if (data.status === 'ok') {
        alert('Availability saved successfully!');
      } else {
        alert('Failed to save availability');
      }
    } catch (error) {
      console.error('Error saving availability:', error);
      alert('An error occurred while saving availability.');
    }
  };

  return (
    <div className="schedule-container">
      {/* Header for setting availability */}
      <h2>Set Your Availability</h2>

      {/* Weekly schedule container */}
      <div className="weekly-schedule">
        {/* Grid container for time labels and days */}
        <div className="schedule-grid">
          {/* Time labels column */}
          <div className="time-labels">
            {/* Placeholder for alignment with the day labels */}
            <div className="time-slot">Time</div>
            {/* Map through the time slots and render each label */}
            {[
              '7:00 am', '8:00 am', '9:00 am', '10:00 am', '11:00 am', 
              '12:00 pm', '1:00 pm', '2:00 pm', '3:00 pm', '4:00 pm', 
              '5:00 pm', '6:00 pm', '7:00 pm', '8:00 pm', '9:00 pm', 
              '10:00 pm', '11:00 pm', '12:00 am'
            ].map((time, index) => (
              <div key={index} className="time-slot">
                {time} {/* Display each time label */}
              </div>
            ))}
          </div>

          {/* Days grid container */}
          <div className="days-grid">
            {/* Map through each day and render the day's schedule */}
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, dayIndex) => (
              <div key={dayIndex} className="day-column">
                {/* Day label */}
                <div className="day-label">{day}</div>
                {/* Map through each time slot and render its availability */}
                {availability[dayIndex].map((slot, timeIndex) => (
                  <div
                    key={timeIndex}
                    className={`time-slot ${slot ? 'available' : ''}`} // Add 'available' class if the time slot is selected
                    onClick={() => toggleTimeSlot(dayIndex, timeIndex)} // Toggle availability on click
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Save availability button at the bottom */}
      <div className="save-availability">
        <button className="save-button" onClick={saveAvailability}>Save Availability</button>
      </div>
    </div>
  );
};

export default ScheduleTutor;

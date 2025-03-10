import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './scheduleTutoree.css';

const ScheduleTutoree = () => {
  const [tutors, setTutors] = useState([]);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const navigate = useNavigate();

  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }

    async function fetchTutors() {
      try {
        const response = await fetch('http://localhost:1337/api/tutors');
        const data = await response.json();
        if (data.status === 'ok') {
          const tutorsWithAvailability = data.tutors.filter(tutor => 
            tutor.availability.some(day => day.some(slot => slot))
          );
          setTutors(tutorsWithAvailability);
        }
      } catch (error) {
        console.error('Error fetching tutors', error);
      }
    }

    fetchTutors();
  }, [navigate]);

  const handleSlotSelection = (tutorId, tutorName, tutorEmail, day, time) => {
    const slotKey = `${tutorId}-${day}-${time}`;
    setSelectedSlots(prevSlots => {
      const isAlreadySelected = prevSlots.some(slot => slot.key === slotKey);
      if (isAlreadySelected) {
        return prevSlots.filter(slot => slot.key !== slotKey);
      }
      return [...prevSlots, { tutorId, tutorName, tutorEmail, day, time, key: slotKey }];
    });
  };

  const handleSaveSlots = async () => {
    try {
        const response = await fetch('http://localhost:1337/api/schedule-session', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            'x-access-token': localStorage.getItem("token")
            },
            body: JSON.stringify({ 
                slots: selectedSlots.map(slot => ({
                tutorName: slot.tutorName,
                tutorEmail: slot.tutorEmail,
                day: slot.day,
                time: slot.time,
                })),
            })
        });
    
        const data = await response.json();
        if (data.status === 'ok') {
            alert('Slots saved successfully!');
            setSelectedSlots([]);
        } else {
            alert('Failed to save slots');
        } 
    }
    catch (error) {
      console.error('Error saving slots:', error);
      alert('Failed to save slots. Please try again.');
    }
  };

  return (
    <div className="schedule-container">
      <h2>Available Tutoring Slots</h2>
      {tutors.length === 0 ? (
        <p>No tutors with available slots at this time.</p>
      ) : (
        tutors.map((tutor) => {
          const availableSlots = tutor.availability.flatMap((day, dayIndex) =>
            day.map((slot, timeIndex) => {
              if (slot) {
                return { 
                  day: dayIndex,
                  dayName: DAYS[dayIndex], 
                  time: `${7 + timeIndex}:00` 
                };
              }
              return null;
            })
          ).filter(Boolean);

          return (
            <div key={tutor._id} className="tutor-availability">
              <h3>{tutor.name}</h3>
              <div className="availability-list">
                {availableSlots.map((slot, index) => {
                  const isSelected = selectedSlots.some(
                    s => s.tutorId === tutor._id &&
                        s.tutorName === tutor.name &&
                        s.tutorEmail === tutor.email && 
                        s.day === slot.dayName && 
                        s.time === slot.time
                  );

                  return (
                    <div
                      key={index}
                      className={`time-slot ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleSlotSelection(tutor._id, tutor.name, tutor.email, slot.dayName, slot.time)}
                    >
                      {slot.dayName}: {slot.time}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })
      )}
      {selectedSlots.length > 0 && (
        <div className="save-button-container">
          <button onClick={handleSaveSlots} className="save-button">
            Save Selected Slots
          </button>
        </div>
      )}
    </div>
  );
};

export default ScheduleTutoree;
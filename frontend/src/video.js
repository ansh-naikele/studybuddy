import React, { useRef, useEffect, useState } from 'react'; // Import React and hooks
import { useNavigate } from 'react-router-dom';
import './video.css'; // Import custom CSS for styling
import { FiMic, FiMicOff, FiVideo, FiVideoOff, FiMessageSquare } from 'react-icons/fi'; // Import icons
import { AiOutlineUserAdd } from 'react-icons/ai';
import Chat from './Chat'; // Import Chat component

// Main component for video conferencing
const VideoConferencing = () => {
  // Refs for video elements
  const localVideoRef = useRef(null); 
  const remoteVideoRef = useRef(null); 
  
  // State variables to manage UI and media stream
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [stream, setStream] = useState(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const navigate = useNavigate();

  // useEffect runs when the component mounts
  useEffect(() => {
    const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login"); // Redirect to login if no token
      }
      startVideo(); // Start the video stream when the component loads
  }, [navigate]);

  // Function to start video and audio streaming
  const startVideo = async () => {
    try {
      // Request user media with both video and audio
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      // If the local video element is available, set its source to the media stream
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = mediaStream;
      }
      setStream(mediaStream); // Store the stream in state
    } catch (error) {
      // Handle errors in accessing media devices
      console.error('Error accessing media devices:', error);
    }
  };

  // Function to toggle video on/off
  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0]; // Get the video track
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled; // Toggle the video track's enabled state
        setIsVideoEnabled(!isVideoEnabled); // Update state to reflect the change
      }
    }
  };

  // Function to toggle audio on/off
  const toggleAudio = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0]; // Get the audio track
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled; // Toggle the audio track's enabled state
        setIsAudioEnabled(!isAudioEnabled); // Update state to reflect the change
      }
    }
  };

  // Render the UI
  return (
    <div className="video-page">
      <div className="video-conference-container">
        {/* Header with session title and invite button */}
        <header className="header">
          <h2>StudyBuddy: Math Tutoring Session</h2>
          <button className="invite-button">
            <AiOutlineUserAdd size={24} />
          </button>
        </header>

        {/* Video container with local and remote video streams */}
        <div className="video-container">
          <div className="main-video">
            <video ref={remoteVideoRef} autoPlay playsInline className="remote-video" />
            <div className="video-placeholder">Main Video</div> {/* Placeholder for remote video */}
          </div>
          <div className="your-video">
            <video ref={localVideoRef} autoPlay playsInline muted className="local-video" />
            <div className="video-placeholder">Your Video</div> {/* Placeholder for local video */}
          </div>
        </div>

        {/* Controls for toggling audio, video, and chat */}
        <div className="controls">
          <button onClick={toggleAudio}>
            {isAudioEnabled ? <FiMic size={20} /> : <FiMicOff size={20} />} {/* Audio toggle icon */}
          </button>
          <button onClick={toggleVideo}>
            {isVideoEnabled ? <FiVideo size={20} /> : <FiVideoOff size={20} />} {/* Video toggle icon */}
          </button>
          <button onClick={() => setIsChatOpen(!isChatOpen)}>
            <FiMessageSquare size={20} /> {/* Chat toggle icon */}
          </button>
        </div>
      </div>

      {/* Chat component, conditionally rendered */}
      <Chat 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)}
        userName={`User_${Math.floor(Math.random() * 1000)}`} // Random username for chat
      />
    </div>
  );
};

export default VideoConferencing;

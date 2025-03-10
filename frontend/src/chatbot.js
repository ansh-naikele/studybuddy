import React, { useEffect } from "react"; // Import React to use JSX and React features
import { Link, useNavigate } from "react-router-dom"; // Import Link from react-router-dom for navigation
import "./chatbot.css"; // Import the CSS file to style the navbar

// Define the Navbar component
const Chatbot = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login"); // Redirect to login if no token
    }
  }, [navigate]);

  // API key and endpoint for AI model
  console.log(process.env.REACT_APP_API_KEY);
  const API_KEY = process.env.REACT_APP_API_KEY;
  const API_URL =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

  // Array of emojis for floating effect
  const emojis = ["✨", "🌟", "💫", "⭐", "🎈", "🎉", "🌈", "🦄", "🚀", "🎨"];

  // Function to add a floating emoji
  function addFloatingEmoji() {
    const emoji = document.createElement("div");
    emoji.className = "floating-emoji";
    emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    emoji.style.left = Math.random() * 100 + "%";
    document.querySelector(".chat-container").appendChild(emoji);
    setTimeout(() => emoji.remove(), 2000);
  }

  // Creates and animates star effect on click
  function createStars(e) {
    const container = document.querySelector(".chat-container");
    const star = document.createElement("div");
    star.className = "star";
    star.innerHTML = "⭐";
    star.style.left = e.clientX - container.getBoundingClientRect().left + "px";
    star.style.top = e.clientY - container.getBoundingClientRect().top + "px";
    container.appendChild(star);
    setTimeout(() => star.remove(), 1000);
  }

  // Call Gemini AI API to get bot response
  async function callGeminiAPI(userInput) {
    try {
      const response = await fetch(`${API_URL}?key=${API_KEY}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: userInput,
                },
              ],
            },
          ],
        }),
      });
      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error("Error:", error);
      return "Oops! Something went wrong. Let's try again! 🎮";
    }
  }

  // Adds a message to the chat container
  function addMessage(message, isUser = false) {
    const chatContainer = document.getElementById("chatContainer");
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${isUser ? "user-message" : "bot-message"}`;
    messageDiv.textContent = message;
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // Add floating emoji for each message
    addFloatingEmoji();
  }

  // Handles sending the user's message
  async function sendMessage() {
    const userInput = document.getElementById("userInput");
    const message = userInput.value.trim();

    if (message === "") return;

    addMessage(message, true);
    userInput.value = "";
    userInput.focus();

    const typingIndicator = document.getElementById("typingIndicator");
    typingIndicator.style.display = "flex";

    const response = await callGeminiAPI(message);
    typingIndicator.style.display = "none";
    addMessage(response);
  }

  window.onload = () => {
    setTimeout(() => {
      addMessage(
        "Hi there! I'm Buddy Bot, your fun AI friend! What would you like to learn about today?"
      );
    }, 500);

    // Sends message when Enter is pressed
    document
      .getElementById("userInput")
      .addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
          sendMessage();
        }
      });

    // Add click event to chat container for star effect
    document
      .querySelector(".chat-container")
      .addEventListener("click", createStars);
  };

  return (
    <>
      <link
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
        rel="stylesheet"
      ></link>

      <div className="container">
        {/* <!-- Header with mascot emoji and title --> */}
        <div className="header">
          <div className="mascot">🤖</div>
          <h1>Buddy Bot</h1>
          <p>Your Super-Fun AI Friend! Let's Chat and Learn Together! ✨</p>
        </div>

        {/* <!-- Chat container with messages, typing indicator, and input field --> */}
        <div className="chat-container">
          <div className="chat-messages" id="chatContainer">
            {/* <!-- Chat messages will be inserted here --> */}
          </div>

          <div className="typing-indicator" id="typingIndicator">
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
          </div>

          <div className="input-container">
            <div className="input-wrapper">
              {/* <!-- User input field --> */}
              <input
                type="text"
                id="userInput"
                placeholder="Type something fun..."
              />
              {/* <!-- Send button to submit messages --> */}
              <button className="send-button" onClick={() => sendMessage()}>
                <i className="fas fa-paper-plane"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Export the Navbar component so it can be used in other parts of the application
export default Chatbot;

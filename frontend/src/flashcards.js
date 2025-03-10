import React, { useEffect } from "react"; // Import React to use JSX and React features
import { useNavigate } from "react-router-dom"; // Import Link from react-router-dom for navigation
import "./flashcards.css"; // Import the CSS file to style the navbar

// Define the Navbar component
const Flashcards = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login"); // Redirect to login if no token
    }
  }, [navigate]);

  // Define API key and URL for generating flashcards
  const API_KEY = process.env.REACT_APP_API_KEY;
  const API_URL =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

  // Initialize flashcards array and current card index
  let flashcards = [];
  let currentCardIndex = 0;

  // Function to generate flashcards based on input topic
  async function generateFlashcards() {
    const topic = document.getElementById("topicInput").value.trim();
    if (!topic) return;

    // Show loading indicator and hide flashcard display and navigation buttons
    document.getElementById("loadingIndicator").style.display = "block";
    document.querySelector(".flashcard-container").style.display = "none";
    document.querySelector(".navigation").style.display = "none";

    try {
      const prompt = `Create 5 flashcards about ${topic}. Format the response as JSON array with "question" and "answer" properties. Example: [{"question": "Q1", "answer": "A1"}]`;

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
                  text: prompt,
                },
              ],
            },
          ],
        }),
      });

      const data = await response.json();
      const text = data.candidates[0].content.parts[0].text;

      // Extract JSON from response if available
      const jsonMatch = text.match(/\[.*\]/s);
      if (jsonMatch) {
        flashcards = JSON.parse(jsonMatch[0]);
        currentCardIndex = 0;
        updateCard();
        document.getElementById("prevButton").disabled = true;
        document.getElementById("nextButton").disabled = false;
      }
    } catch (error) {
      console.error("Error:", error);
      document.getElementById("cardFront").textContent =
        "Oops! Something went wrong. Please try again!";
      document.getElementById("cardBack").textContent =
        "Error generating flashcards";
    }

    // Hide loading indicator and show flashcards and navigation
    document.getElementById("loadingIndicator").style.display = "none";
    document.querySelector(".flashcard-container").style.display = "block";
    document.querySelector(".navigation").style.display = "flex";

    console.log(flashcards)
  }

  // Update flashcard content based on current index
  function updateCard() {
    if (flashcards.length === 0) return;

    const card = flashcards[currentCardIndex];
    document.getElementById("cardFront").innerText = card.question;
    document.getElementById("cardBack").innerText = card.answer;

    // Reset card flip state
    document.getElementById("flashcard").classList.remove("flipped");

    // Enable or disable navigation buttons based on index
    document.getElementById("prevButton").disabled = currentCardIndex === 0;
    document.getElementById("nextButton").disabled =
      currentCardIndex === flashcards.length - 1;
  }

  // Toggle flashcard between front and back view
  function flipCard() {
    document.getElementById("flashcard").classList.toggle("flipped");
  }

  // Show previous flashcard if available
  function previousCard() {
    if (currentCardIndex > 0) {
      currentCardIndex--;
      updateCard();
    }
  }

  // Show next flashcard if available
  function nextCard() {
    if (currentCardIndex < flashcards.length - 1) {
      currentCardIndex++;
      updateCard();
    }
  }

  window.onload = () => {
    // Trigger flashcard generation on Enter key press in input field
    document
      .getElementById("topicInput")
      .addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
          generateFlashcards();
        }
      });
  };

  return (
    <>
      <link
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
        rel="stylesheet"
      ></link>
      <div className="container">
        <div className="header">
          {/* <!-- Mascot icon and title with a short description --> */}
          <div className="mascot">🎯</div>
          <h1>Buddy Cards</h1>
          <p>Learn anything with fun flashcards! ✨</p>
        </div>

        <div className="main-container">
          {/* <!-- Controls for entering a topic and generating cards --> */}
          <div className="controls">
            <div className="input-wrapper">
              <input
                type="text"
                id="topicInput"
                placeholder="Enter a topic to study..."
              />
            </div>
            <button className="button" onClick={() => generateFlashcards()}>
              <i className="fas fa-magic"></i>
              Generate Cards
            </button>
          </div>

          {/* <!-- Loading indicator section --> */}
          <div className="loading" id="loadingIndicator">
            <p></p>
            <div className="loading-dots">
              <div className="loading-dot"></div>
              <div className="loading-dot"></div>
              <div className="loading-dot"></div>
            </div>
          </div>

          {/* <!-- Flashcard container with front and back face --> */}
          <div className="flashcard-container">
            <div
              className="flashcard"
              id="flashcard"
              onClick={() => flipCard()}
            >
              <div className="card-face card-front" id="cardFront">
                Click "Generate Cards" to start learning!
              </div>
              <div className="card-face card-back" id="cardBack">
                Your answers will appear here!
              </div>
            </div>
          </div>

          {/* <!-- Navigation buttons for previous and next flashcards --> */}
          <div className="navigation">
            <button
              className="nav-button"
              onClick={() => previousCard()}
              id="prevButton"
            >
              <i className="fas fa-chevron-left"></i>
            </button>
            <button
              className="nav-button"
              onClick={() => nextCard()}
              id="nextButton"
            >
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// Export the Navbar component so it can be used in other parts of the application
export default Flashcards;

import React from "react";
import { useNavigate } from "react-router-dom";
import "./result.css";

export function Result() {
  const navigate = useNavigate();

  function handlePlayAgain() {
    navigate("/matchmaking");
  }

  function handleBackToHome() {
    navigate("/");
  }

  return (
    <div className="result-container">
      <h1 className="result-title">Your Game Has Ended</h1>
      <p className="result-message">
        Thank you for playing! Would you like to play another game or return to
        the home page?
      </p>
      <div className="buttons-container">
        <button className="play-again-button" onClick={handlePlayAgain}>
          Play Again
        </button>
        <button className="home-button" onClick={handleBackToHome}>
          Back to Home
        </button>
      </div>
    </div>
  );
}

export default Result;

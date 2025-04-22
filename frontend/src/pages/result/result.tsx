import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./result.css";

interface GameResult {
  winner: number;
  score: number[];
  finalScore?: number[];
  players: string[];
  timestamp: string;
}

export function Result() {
  const navigate = useNavigate();
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const gameResultString = sessionStorage.getItem("gameResult");
    if (gameResultString) {
      try {
        const parsedResult = JSON.parse(gameResultString);
        console.log("Parsed game result:", parsedResult); // Debug log

        // More robust check for score data
        const finalScoreData = parsedResult.finalScore || parsedResult.score;
        const playersArray = parsedResult.players || parsedResult.player;

        if (
          parsedResult &&
          finalScoreData &&
          Array.isArray(finalScoreData) &&
          finalScoreData.length === 2 &&
          typeof finalScoreData[0] === "number" &&
          typeof finalScoreData[1] === "number" &&
          playersArray &&
          Array.isArray(playersArray) &&
          playersArray.length === 2 &&
          typeof parsedResult.winner !== "undefined"
        ) {
          // Standardize the result format
          setGameResult({
            winner: parsedResult.winner,
            score: finalScoreData,
            finalScore: finalScoreData,
            players: playersArray,
            timestamp: parsedResult.timestamp || new Date().toISOString(),
          });

          // Clear session storage after successful use
          setTimeout(() => {
            sessionStorage.removeItem("gameResult");
          }, 1000);
        } else {
          console.error("Invalid game result structure:", parsedResult);
          setTimeout(() => navigate("/queue"), 2000);
        }
      } catch (e) {
        console.error("Failed to parse game result:", e);
        setTimeout(() => navigate("/queue"), 2000);
      }
    } else {
      console.log("No game result found in session storage");
      setTimeout(() => navigate("/queue"), 2000);
    }
    setLoading(false);
  }, [navigate]);

  function handlePlayAgain() {
    navigate("/queue");
  }

  function handleBackToHome() {
    navigate("/");
  }

  if (loading) {
    return (
      <div className="result-container">
        <h1 className="result-title">Loading Results...</h1>
      </div>
    );
  }

  if (
    !gameResult ||
    !gameResult.score ||
    !Array.isArray(gameResult.score) ||
    gameResult.score.length !== 2
  ) {
    return (
      <div className="result-container">
        <h1 className="result-title">Game Results Not Available</h1>
        <p className="result-message">Redirecting to matchmaking...</p>
      </div>
    );
  }

  return (
    <div className="result-container">
      <h1 className="result-title">Your Game Has Ended</h1>
      <div className="result-details">
        <p className="result-players">
          {gameResult.players[0]} - {gameResult.players[1]}
        </p>
        <p className="result-score">
          Final Score: {gameResult.score[0]} - {gameResult.score[1]}
        </p>
        <p className="result-winner">
          {gameResult.winner === 0
            ? `${gameResult.players[0]} Wins!`
            : `${gameResult.players[1]} Wins!`}
        </p>
      </div>
      <hr />
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

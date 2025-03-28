import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useApi } from "@/utils/api";
import "./finalscore.css";

interface Player {
  id: string;
  y: number;
}

interface GameState {
  id: string;
  ball: { x: number; y: number; dx: number; dy: number };
  players: Record<string, Player>;
  score?: [number, number];
}

interface GameResult {
  roomIdentifier: string;
  player1UserId: number;
  player2UserId: number;
  winner: number;
  player1Name: string;
  player2Name: string;
  score: [number | undefined, number | undefined];
}

const FinalScore: React.FC = () => {
  const navigate = useNavigate();
  const api = useApi();
  const [loading, setLoading] = useState(true);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState<string>("");

  useEffect(() => {
    const fetchGameResult = async () => {
      try {
        setLoading(true);
        console.log("Fetching last game...");
        const user = await api.Users.usersControllerMe();
        const lastGame = await api.Games.gamesControllerFindLastGame({
          userId: user.id,
        });
        console.log("Last game:", lastGame);
        if (!lastGame || lastGame.id == undefined) {
          console.error("No completed game found");
          setError("No completed game found");
          setLoading(false);
          return;
        }

        // Get player information
        // try {
        //   const player1Response = await api.Users.usersControllerFindOne({
        //     id: lastGame.player1UserId,
        //   });

        //   const player2Response = await api.Users.usersControllerFindOne({
        //     id: lastGame.player2UserId,
        //   });

        //   const currentUserResponse = await api.Users.usersControllerMe();

        //   setPlayerName(currentUserResponse.nickname || "Unknown");

        //   // Set the game result
        //   setGameResult({
        //     roomIdentifier: lastGame.roomIdentifier,
        //     player1UserId: lastGame.player1UserId,
        //     player2UserId: lastGame.player2UserId,
        //     winner: lastGame.winnerUserId,
        //     player1Name: player1Response.nickname || "Player 1",
        //     player2Name: player2Response.nickname || "Player 2",
        //     score:
        //       Array.isArray(lastGame.score) && lastGame.score.length === 2
        //         ? ([lastGame.score[0], lastGame.score[1]] as [
        //             number | undefined,
        //             number | undefined,
        //           ])
        //         : [0, 0],
        //   });
        // } catch (playerError) {
        //   console.error("Error fetching player data:", playerError);
        //   setError("Error fetching player information");
        // }

        setLoading(false);
      } catch (err) {
        console.error("Error in fetchGameResult:", err);
        setError("Failed to load game result");
        setLoading(false);
      }
    };

    fetchGameResult();
  }, []);

  const handlePlayAgain = () => {
    navigate("/matchmaking");
  };

  const handleBackToHome = () => {
    navigate("/");
  };

  if (loading) {
    return (
      <div className="final-score-container loading">
        <div className="loading-text">Loading result...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="final-score-container error">
        <div className="error-message">{error}</div>
        <button className="back-button" onClick={handleBackToHome}>
          Back to Home
        </button>
      </div>
    );
  }

  if (!gameResult) {
    return (
      <div className="final-score-container error">
        <div className="error-message">No game result available</div>
        <button className="back-button" onClick={handleBackToHome}>
          Back to Home
        </button>
      </div>
    );
  }

  const isWinner =
    gameResult.winner ===
    (playerName === gameResult.player1Name
      ? gameResult.player1UserId
      : gameResult.player2UserId);

  return (
    <div className="final-score-container">
      <div className="game-result-header">
        {isWinner ? (
          <>
            <h1 className="win-text">YOU WIN!</h1>
            <div className="trophy-icon">🏆</div>
          </>
        ) : (
          <h1 className="lose-text">GAME OVER</h1>
        )}
      </div>

      <div className="score-display">
        <div className="player-column">
          <div className="player-name">{gameResult.player1Name}</div>
          <div className="player-score">{gameResult.score[0]}</div>
        </div>

        <div className="vs">VS</div>

        <div className="player-column">
          <div className="player-name">{gameResult.player2Name}</div>
          <div className="player-score">{gameResult.score[1]}</div>
        </div>
      </div>

      <div className="result-message">
        {isWinner
          ? "Congratulations! You've won the match!"
          : "Better luck next time!"}
      </div>

      <div className="action-buttons">
        <button className="play-again-button" onClick={handlePlayAgain}>
          Play Again
        </button>

        <button className="home-button" onClick={handleBackToHome}>
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default FinalScore;

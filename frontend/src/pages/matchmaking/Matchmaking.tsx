import React, { useEffect, useState } from "react";
import { useApi } from "@/utils/api";
import {
  Game as GameType,
  CreateGameDto,
  CreateGameDtoStatusEnum,
} from "../../generated-api";
import { v4 as uuidv4 } from "uuid";
import "./Matchmaking.css";
import { useNavigate } from "react-router-dom";

const Matchmaking = () => {
  const [isLoading, setIsLoading] = useState(true); // Start with loading true
  const [message, setMessage] = useState<string | null>(null);
  const [availableGames, setAvailableGames] = useState<GameType[]>([]);
  const api = useApi();
  const navigate = useNavigate();

  const checkCurrentGame = async () => {
    try {
      const response = await api.Games.gamesControllerFindCurrentGame();
      if (response.id == undefined) {
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error checking current game:", error);
      return false;
    }
  };

  const fetchAvailableGames = async () => {
    try {
      // First check if user is in a current game
      const isInGame = await checkCurrentGame();
      if (isInGame) {
        const response = await api.Games.gamesControllerFindCurrentGame();
        if (response) {
          navigate(`/lobby/${response.roomIdentifier}`);
        }
        return;
      }
      // Fetch available games only if user is not in a game
      const games = await api.Games.gamesControllerFindAllExceptUser();
      if (games && Array.isArray(games)) {
        setAvailableGames(games);
      } else {
        setAvailableGames([]);
      }
    } catch (error) {
      console.error("Error fetching games:", error);
      setMessage("Failed to fetch available games");
      setAvailableGames([]);
    } finally {
      setIsLoading(false); // Set loading to false after fetch completes
    }
  };

  useEffect(() => {
    // On component mount, fetch everything
    fetchAvailableGames();

    // Set up polling interval
    const interval = setInterval(fetchAvailableGames, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleCreateGame = async () => {
    try {
      setIsLoading(true);
      setMessage(null);

      const createGameDto: CreateGameDto = {
        roomIdentifier: uuidv4(),
        status: CreateGameDtoStatusEnum.Pending,
        score: [0, 0],
        player1UserId: 0,
        player2UserId: 0,
        winnerUserId: 0,
        createdAt: new Date(),
      };

      await api.Games.gamesControllerCreate({ createGameDto });

      setMessage(
        `Game created successfully! Room ID: ${createGameDto.roomIdentifier}. Waiting for opponent...`,
      );
      setTimeout(() => {
        navigate(`/lobby/${createGameDto.roomIdentifier}`);
      }, 1500);
    } catch (error) {
      console.error("Error creating game:", error);
      setMessage("Failed to create game. You might already be in a game.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinGame = async (userId: number) => {
    try {
      setIsLoading(true);
      const userIdString = userId.toString();
      if (userIdString === "" || userIdString == undefined) {
        throw new Error("Game ID is required");
      }
      await api.Games.gamesControllerJoinGame({
        id: userIdString,
      });
      setMessage("Successfully joined the game!");

      const currentGame = await api.Games.gamesControllerFindCurrentGame();

      if (currentGame && currentGame.roomIdentifier) {
        setTimeout(() => {
          navigate(`/lobby/${currentGame.roomIdentifier}`);
        }, 1500);
      }
    } catch (error) {
      console.error("Error joining game:", error);
      setMessage("Failed to join game");
      setIsLoading(false);
    }
  };

  // Show loading indicator while initial check is happening
  if (isLoading && availableGames.length === 0) {
    return (
      <div className="game-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Checking game status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="game-page">
      <div className="game-header">
        <h1>Pong Game</h1>
        <button
          className={`create-game-btn ${isLoading ? "loading" : ""}`}
          onClick={handleCreateGame}
          disabled={isLoading}
        >
          {isLoading ? "Creating..." : "Create New Game"}
        </button>
      </div>

      <div className="available-games-section">
        <h2>Available Games</h2>
        {availableGames.length === 0 ? (
          <div className="no-games">No games available to join</div>
        ) : (
          <div className="games-grid">
            {availableGames.map((game) => (
              <div key={game.id} className="game-card">
                <div className="game-info">
                  <span className="room-id">Room: {game.roomIdentifier}</span>
                  <span className="status">Status: {game.status}</span>
                  <span className="player1">
                    Opponent: {game.player1UserId}
                  </span>
                </div>
                <button
                  className="join-btn"
                  onClick={() => handleJoinGame(game.id)}
                  disabled={
                    isLoading || game.status !== CreateGameDtoStatusEnum.Pending
                  }
                >
                  {isLoading
                    ? "Joining..."
                    : game.status === CreateGameDtoStatusEnum.Pending
                      ? "Join Game"
                      : "Game In Progress"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {message && (
        <div
          className={`message ${message.includes("Failed") ? "error" : "success"}`}
        >
          {message}
        </div>
      )}
    </div>
  );
};

export default Matchmaking;

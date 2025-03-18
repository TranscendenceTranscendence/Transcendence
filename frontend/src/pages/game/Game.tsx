import React, { useEffect, useState } from "react";
import { useApi } from "@/utils/api";
import {
  Game as GameType,
  CreateGameDto,
  CreateGameDtoStatusEnum,
} from "../../generated-api";
import { v4 as uuidv4 } from "uuid";
import "./Game.css";

const Game = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [availableGames, setAvailableGames] = useState<GameType[]>([]);
  const api = useApi();

  const fetchAvailableGames = async () => {
    try {
      const games = await api.Games.gamesControllerFindAllExceptUser();
      if (games && Array.isArray(games)) {
        setAvailableGames(games);
        console.log("games: ", games);
      } else {
        setAvailableGames([]);
      }
    } catch (error) {
      console.error("Error fetching games:", error);
      setMessage("Failed to fetch available games");
      setAvailableGames([]);
    }
  };

  useEffect(() => {
    fetchAvailableGames();
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
    } catch (error) {
      console.error("Error creating game:", error);
      setMessage("Failed to create game. You might already be in a game.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinGame = async (gameId: number) => {
    try {
      setIsLoading(true);
      const gameIdString = gameId.toString();
      if (gameIdString === "" || gameIdString == undefined) {
        throw new Error("Game ID is required");
      }
      await api.Games.gamesControllerJoinGame({ id: gameIdString });
      setMessage("Successfully joined the game!");
      fetchAvailableGames();
    } catch (error) {
      console.error("Error joining game:", error);
      setMessage("Failed to join game");
    } finally {
      setIsLoading(false);
    }
  };

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
          className={`message ${message.includes("error") ? "error" : "success"}`}
        >
          {message}
        </div>
      )}
    </div>
  );
};

export default Game;

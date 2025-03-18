import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Added useNavigate
import { useApi } from "@/utils/api";
import { Game as GameType } from "@/generated-api";

const Lobby = () => {
  const { roomIdentifier } = useParams();
  const [game, setGame] = useState<GameType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const api = useApi();
  const navigate = useNavigate(); // Added for navigation

  const fetchGame = async () => {
    if (!roomIdentifier) {
      setError("No room identifier provided");
      setLoading(false);
      return;
    }

    try {
      const gameData = await api.Games.gamesControllerFindByRoomIdentifier({
        roomIdentifier: roomIdentifier,
      });

      // Check if the response indicates access denied (user not in game)
      if (gameData && "success" in gameData && gameData.success === false) {
        console.warn("Access denied:", gameData);
        // Redirect to matchmaking if user is not a participant
        navigate("/matchmaking");
        return;
      }

      if (!gameData || ("success" in gameData && gameData.success === false)) {
        setError("Game not found or access denied");
        setLoading(false);
        return;
      }

      setGame(gameData as GameType);
      setError(""); // Clear any previous errors
    } catch (err) {
      console.error("Failed to fetch game:", err);
      setError("Failed to load game information");

      // If we get a 403 error (Forbidden), redirect to matchmaking
      if (err.status === 403) {
        navigate("/matchmaking");
        return;
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGame();
    const intervalId = setInterval(() => {
      fetchGame();
    }, 1500);
    return () => {
      clearInterval(intervalId);
    };
  }, [roomIdentifier]); // Added roomIdentifier as a dependency

  if (loading && !game) {
    return <div className="text-center p-8">Loading game lobby...</div>;
  }

  if (error && !game) {
    return <div className="text-center p-8 text-red-500">{error}</div>;
  }

  if (!game) {
    return <div className="text-center p-8">Game not found</div>;
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Game Lobby</h1>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Game Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">Room ID:</p>
            <p className="font-medium">{game.roomIdentifier}</p>
          </div>
          <div>
            <p className="text-gray-600">Status:</p>
            <p className="font-medium">{game.status}</p>
          </div>
          <div>
            <p className="text-gray-600">Player 1:</p>
            <p className="font-medium">{game.player1UserId || "Waiting..."}</p>
          </div>
          <div>
            <p className="text-gray-600">Player 2:</p>
            <p className="font-medium">{game.player2UserId || "Waiting..."}</p>
          </div>
        </div>
      </div>

      <div className="text-center mt-8">
        <p className="text-gray-600 mb-4">
          {game.player2UserId
            ? "Game will start shortly..."
            : "Waiting for another player to join..."}
        </p>
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>
    </div>
  );
};

export default Lobby;

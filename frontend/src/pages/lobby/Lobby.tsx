import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Added useNavigate
import { useApi } from "@/utils/api";
import { Game as GameType } from "@/generated-api";

const Lobby = () => {
  const { roomIdentifier } = useParams();
  const [game, setGame] = useState<GameType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const api = useApi();
  const navigate = useNavigate();
  const hasFetchedRef = useRef(false);
  const pollingIntervalRef = useRef<number | null>(null);

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

      if (gameData.id == undefined) {
        navigate("/matchmaking");
        return;
      }

      if (gameData.status == "ongoing") {
        navigate("/game");
        return;
      }

      if (gameData.status == "countdown") {
        navigate("/game");
        return;
      }

      setGame(gameData as GameType);
      setError("");
    } catch (err) {
      console.error("Failed to fetch game:", err);
      setError("Failed to load game information");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch when component mounts
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchGame();
    }

    // Set up polling every 3 seconds
    pollingIntervalRef.current = window.setInterval(() => {
      fetchGame();
    }, 3000);

    // Clean up interval when component unmounts
    return () => {
      if (pollingIntervalRef.current !== null) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [roomIdentifier, navigate, api]);

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

import { useConfig } from "@/utils/config";
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { Game } from "@/generated-api";
import { useApi } from "@/utils/api";
import { useNavigate } from "react-router-dom";

export default function PongGame() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameState, setGameState] = useState<Game | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const config = useConfig();
  const api = useApi();
  const navigate = useNavigate();

  const isUserInGame = async () => {
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

  useEffect(() => {
    const initGame = async () => {
      const inGame = await isUserInGame();
      if (!inGame) {
        navigate("/matchmaking");
        return;
      }

      try {
        const game = await api.Games.gamesControllerFindCurrentGame();
        setGameState(game);
        setRoomId(game.roomIdentifier);
      } catch (error) {
        console.error("Error fetching game:", error);
        return;
      }

      const newSocket = io(config.backendUrl);
      setSocket(newSocket);

      newSocket.on("connect", () => {
        console.log("Connected to server:", newSocket.id);
        newSocket.emit("joinGame", { id: roomId });
      });

      newSocket.on("gameState", (state) => {
        console.log("Game State Updated:", state);
        setGameState(state);
      });

      // Listen for countdown events from the server
      newSocket.on("countdown", (count) => {
        setCountdown(count);
      });

      // Listen for game start event
      newSocket.on("gameStart", () => {
        setCountdown(null); // Clear countdown
        // Additional game start logic
      });
    };

    initGame();

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  return (
    <div>
      <h1>Multiplayer Pong</h1>
      <p>Room ID: {roomId}</p>

      {countdown !== null && (
        <div className="countdown">
          <h2>Game starting in: {countdown}</h2>
        </div>
      )}

      {gameState && countdown === null && (
        <div className="game-container">
          {/* Game board rendering */}
          <pre>{JSON.stringify(gameState, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

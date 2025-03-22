import { useApi } from "@/utils/api";
import { useConfig } from "@/utils/config";
import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useNavigate } from "react-router-dom";

// Define proper types for game state
interface Player {
  id: string;
  y: number;
}

interface GameState {
  id: string;
  ball: { x: number; y: number; dx: number; dy: number };
  players: Record<string, Player>;
}

export default function Pong() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [gameId, setGameId] = useState<string>("");
  const [gameFetched, setGameFetched] = useState<boolean>(false);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const api = useApi();
  const config = useConfig();
  const socketRef = useRef<Socket | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Create socket connection
    if (!socketRef.current) {
      socketRef.current = io(config.backendUrl);
    }

    const socket = socketRef.current;

    // Fetch the current game once
    const fetchGame = async () => {
      try {
        const game = await api.Games.gamesControllerFindCurrentGame();
        console.log("Fetched game:", game);
        if (game.roomIdentifier == undefined) {
          navigate("/matchmaking");
          return;
        }
        if (game && game.roomIdentifier) {
          setGameId(game.roomIdentifier);
          setGameFetched(true);

          if (socket.connected) {
            socket.emit("joinGame", { gameId: game.roomIdentifier });
          }
        }
      } catch (e) {
        console.error("Error fetching game:", e);
      }
    };

    if (!gameFetched) {
      fetchGame();
    }

    // Set up socket event listeners
    socket.on("connect", () => {
      console.log("Connected to game server");
      setPlayerId(socket.id);

      // Only join game if we already have a gameId
      if (gameId) {
        console.log("Joining game:", gameId);
        socket.emit("joinGame", { gameId });
      }
    });

    socket.on("update", (state) => {
      setGameState(state);
    });

    // Countdown listener
    socket.on("countdown", (count) => {
      console.log("countdown", count);
      console.log("Game starting in:", count);
    });

    // Game start listener
    socket.on("gameStart", () => {
      console.log("Game started!");
    });

    // Clean up
    return () => {
      socket.off("connect");
      socket.off("update");
      socket.off("countdown");
      socket.off("gameStart");
    };
  }, [gameId, gameFetched, api, config.backendUrl]);

  const movePaddle = (event: React.MouseEvent) => {
    if (playerId && socketRef.current && gameId) {
      // Calculate y position as percentage of screen height
      const yPercent = (event.clientY / window.innerHeight) * 100;
      socketRef.current.emit("move", { gameId, y: yPercent });
    }
  };

  // Show loading state when game state isn't available
  if (!gameState) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "black",
          color: "white",
        }}
      >
        Loading game...
      </div>
    );
  }

  return (
    <div
      onMouseMove={movePaddle}
      style={{
        background: "black",
        width: "100vw",
        height: "100vh",
        position: "relative",
      }}
    >
      {/* Ball */}
      <div
        style={{
          position: "absolute",
          top: `${gameState.ball.y}%`,
          left: `${gameState.ball.x}%`,
          width: "10px",
          height: "10px",
          background: "white",
          borderRadius: "50%",
        }}
      />

      {/* Players/Paddles */}
      {Object.values(gameState.players).map((player) => (
        <div
          key={player.id}
          style={{
            position: "absolute",
            top: `${player.y}%`,
            left:
              player.id === Object.keys(gameState.players)[0] ? "5%" : "90%",
            width: "10px",
            height: "50px",
            background: "white",
            borderRadius: "4px",
          }}
        />
      ))}

      {/* Score display could go here */}
    </div>
  );
}

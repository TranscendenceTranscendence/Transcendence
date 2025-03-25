import { useApi } from "@/utils/api";
import { useConfig } from "@/utils/config";
import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import "./Game.css"; // Import your scoped CSS

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

export default function Pong() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [gameId, setGameId] = useState<string>("");
  const [gameFetched, setGameFetched] = useState<boolean>(false);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [socketConnected, setSocketConnected] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const api = useApi();
  const config = useConfig();
  const socketRef = useRef<Socket | null>(null);
  const navigate = useNavigate();
  const isComponentMounted = useRef<boolean>(true);

  // Create socket connection (only once)
  useEffect(() => {
    console.log("Socket setup effect running");
    // Create socket connection with authentication token
    if (!socketRef.current) {
      console.log("Creating new socket connection");
      const token = localStorage.getItem("access_token");

      if (!token) {
        setError("No authentication token found");
        return;
      }

      socketRef.current = io(config.backendUrl, {
        auth: { token },
        transports: ["websocket"],
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      // Set up socket event listeners
      const socket = socketRef.current;

      socket.on("connect", () => {
        setSocketConnected(true);
        setPlayerId(socket.id);
      });

      socket.on("connect_error", (err) => {
        console.error("Socket connection error:", err);
        setError(`Connection error: ${err.message}`);
        setSocketConnected(false);
      });

      socket.on("disconnect", (reason) => {
        console.log("Socket disconnected:", reason);
        setSocketConnected(false);
      });

      socket.on("update", (state) => {
        setGameState(state);
      });

      socket.on("countdown", (count) => {
        console.log("Game starting in:", count);
      });

      socket.on("gameStart", () => {
        console.log("Game started!");
      });
    }

    // Clean up on component unmount
    return () => {
      console.log("Cleaning up socket setup effect");
      isComponentMounted.current = false;

      if (socketRef.current) {
        // Keep the socket connection alive when navigating to other pages
        // Don't disconnect the socket
      }
    };
  }, [config.backendUrl]); // Only depend on config.backendUrl

  // Handle game fetching and joining in a separate effect
  useEffect(() => {
    if (!socketConnected || gameFetched) return;

    const fetchGame = async () => {
      try {
        const game = await api.Games.gamesControllerFindCurrentGame();

        if (!game || !game.roomIdentifier) {
          setError("No active game found");
          setTimeout(() => navigate("/matchmaking"), 1300);
          return;
        }
        console.log("Fetched game:", game);

        setGameId(game.roomIdentifier);
        setGameFetched(true);
      } catch (e) {
        console.error("Error fetching game:", e);
        setError("Failed to fetch game data");
      }
    };

    fetchGame();
  }, [socketConnected, api, navigate]);

  // Join game when both gameId and socket are ready
  useEffect(() => {
    console.log("joinGame effect running");
    if (!socketConnected || !gameId || !socketRef.current) return;

    console.log("Socket and gameId both ready, joining game:", gameId);

    // Make sure you're sending the correct structure
    socketRef.current.emit("joinGame", { gameId });

    return () => {
      console.log("Cleaning up joinGame effect");
    };
  }, [socketConnected, gameId]);

  const movePaddle = (event: React.MouseEvent) => {
    if (playerId && socketRef.current && gameId && socketConnected) {
      const yPercent = (event.clientY / window.innerHeight) * 100;
      socketRef.current.emit("move", { gameId, y: yPercent });
    }
  };

  if (!gameState) {
    return (
      <div className="pong-game">
        <div className="loading-container">
          {error ? (
            <div style={{ color: "red" }}>{error}</div>
          ) : (
            <>
              <div>Loading game...</div>
              <div style={{ fontSize: "12px" }}>
                {socketConnected ? "Socket connected ✓" : "Connecting..."}
              </div>
              {gameId && (
                <div style={{ fontSize: "12px" }}>Game ID: {gameId}</div>
              )}
              {socketConnected && gameId && !gameState && (
                <button
                  onClick={() => {
                    if (socketRef.current && gameId) {
                      console.log("Force joining game:", gameId);
                      socketRef.current.emit("joinGame", { gameId });
                    }
                  }}
                  style={{
                    marginTop: "20px",
                    padding: "8px 16px",
                    background: "#333",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Force Join Game
                </button>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  // Game interface wrapped in the pong-game class for CSS scoping
  return (
    <div className="pong-game" onMouseMove={movePaddle}>
      <div id="table">
        {/* Ball */}
        <div
          id="ball"
          style={{
            position: "absolute",
            top: `${gameState.ball.y}%`,
            left: `${gameState.ball.x}%`,
          }}
        />

        {/* Players/Paddles */}
        {Object.entries(gameState.players).map(([id, player], index) => (
          <div
            key={player.id}
            id={index === 0 ? "player1" : "player2"}
            style={{
              position: "absolute",
              top: `${player.y}%`,
            }}
          />
        ))}

        <div id="line"></div>
        <div id="scored">{gameState.score ? gameState.score[0] : 0}</div>
        <div id="conceded">{gameState.score ? gameState.score[1] : 0}</div>
      </div>
    </div>
  );
}

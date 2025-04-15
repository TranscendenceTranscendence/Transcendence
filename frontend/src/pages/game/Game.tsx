import { useApi } from "@/utils/api";
import { useConfig } from "@/utils/config";
import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import "./Game.css"; // Import your scoped CSS
import { Game } from "@/generated-api";

interface Player {
  id: string;
  y: number;
  playerNumber: number;
}

interface GameState {
  id: string;
  ball: { x: number; y: number; dx: number; dy: number };
  players: Record<string, Player>;
  score?: [number, number];
}

export default function Pong() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [roomId, setRoomId] = useState<string>("");
  const [gameFetched, setGameFetched] = useState<boolean>(false);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [socketConnected, setSocketConnected] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const api = useApi();
  const config = useConfig();
  const socketRef = useRef<Socket | null>(null);
  const navigate = useNavigate();
  const isComponentMounted = useRef<boolean>(true);
  const [playerNumber, setPlayerNumber] = useState<number>(-1);
  const [count, setCount] = useState<number>(-1);
  const [playerNames, setPlayerNames] = useState<{
    current: string;
    opponent: string;
  }>({
    current: "Player",
    opponent: "Opponent",
  });

  useEffect(() => {
    if (!socketRef.current) {
      const token = localStorage.getItem("access_token");

      if (!token) {
        setError("No authentication token found");
        return;
      }

      socketRef.current = io(config.backendUrl + "/game", {
        auth: { token },
        transports: ["websocket"],
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

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
        void reason;
        setSocketConnected(false);
      });

      socket.on("update", (state) => {
        setGameState(state);
      });

      socket.on("countdown", (count) => {
        setCount(count);
      });

      socket.on("gameStart", () => {
        // console.log("Game started");
      });

      socket.on("removePlayer", () => {
        navigate("/result");
      });
    }

    return () => {
      isComponentMounted.current = false;

      if (socketRef.current) {
        // console.log("Player has left the page, but socket remains connected");
      }
    };
  }, [config.backendUrl]);

  async function checkPlayerNumber(game: Game) {
    try {
      const currentUserId = (await api.Users.usersControllerMe()).id;

      if (currentUserId === game.player1UserId) {
        setPlayerNumber(0);
      } else if (currentUserId === game.player2UserId) {
        setPlayerNumber(1);
      } else {
        setPlayerNumber(-1);
        console.error("Current user is not a player in this game");
      }
    } catch (error) {
      console.error("Error determining player number:", error);
    }
  }

  async function fetchPlayerNames(game: Game) {
    try {
      const player1Data = await api.Users.usersControllerFindOne({
        id: game.player1UserId,
      });

      const player2Data = await api.Users.usersControllerFindOne({
        id: game.player2UserId,
      });

      setPlayerNames({
        current: player1Data.nickname || `Player ${game.player1UserId}`,
        opponent: player2Data.nickname || `Player ${game.player2UserId}`,
      });
    } catch (error) {
      console.error("Error fetching player names:", error);
    }
  }

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

        setRoomId(game.roomIdentifier);
        await checkPlayerNumber(game);
        await fetchPlayerNames(game); // Add this line
        setGameFetched(true);
      } catch (e) {
        console.error("Error fetching game:", e);
        setError("Failed to fetch game data");
      }
    };

    fetchGame();
  }, [socketConnected, api, navigate]);

  useEffect(() => {
    if (!socketConnected || !roomId || !socketRef.current || playerNumber == -1)
      return;

    socketRef.current.emit("joinGame", { roomId, playerId, playerNumber });

    return () => {
      // console.log("Cleaning up socket connection");
    };
  }, [socketConnected, roomId, playerNumber]);

  const movePaddle = (event: React.MouseEvent) => {
    if (playerId && socketRef.current && roomId && socketConnected) {
      const tableElement = document.getElementById("table");

      if (tableElement) {
        const tableRect = tableElement.getBoundingClientRect();

        // Calculate position relative to the table
        const relativeY = event.clientY - tableRect.top;

        // Convert to percentage of table height (0-100)
        const yPercent = (relativeY / tableRect.height) * 100;

        // Get actual paddle height as percentage of table
        const paddleElement = document.getElementById(
          playerNumber === 0 ? "player1" : "player2",
        );

        let paddleHeightPercent = 10;

        if (paddleElement) {
          const paddleRect = paddleElement.getBoundingClientRect();
          paddleHeightPercent = (paddleRect.height / tableRect.height) * 100;
        }

        const buffer = 0.5;
        const minY = paddleHeightPercent / 2 - buffer;
        const maxY = 100 - paddleHeightPercent / 2 + buffer;

        const clampedY = Math.max(minY, Math.min(maxY, yPercent));

        socketRef.current.emit("move", { roomId, y: clampedY });
      } else {
        const yPercent = (event.clientY / window.innerHeight) * 100;
        socketRef.current.emit("move", { roomId, y: yPercent });
      }
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
              {roomId && (
                <div style={{ fontSize: "12px" }}>Game ID: {roomId}</div>
              )}
              {socketConnected && roomId && !gameState && (
                <button
                  onClick={() => {
                    if (socketRef.current && roomId) {
                      socketRef.current.emit("joinGame", { roomId });
                      location.reload();
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

  return (
    <div
      className="pong-game"
      onMouseMove={movePaddle}
      style={{ position: "relative" }}
    >
      {count >= 0 && count <= 5 && (
        <div className="countdown-overlay">
          <div className="countdown-number">{count === 0 ? "GO!" : count}</div>
        </div>
      )}

      {/* Player Names Banner */}
      <div className="player-names-container">
        <div className="player-name current">
          <span className="player-value">{playerNames.current}</span>
        </div>
        <div className="player-name opponent">
          <span className="player-value">{playerNames.opponent}</span>
        </div>
      </div>

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
        {Object.entries(gameState.players).map(([id, player]) => {
          const isPlayer1 = player.playerNumber === 0;

          const tableElement = document.getElementById("table");
          let paddleHeightPercent = 10;

          if (tableElement) {
            const paddleElement = document.getElementById(
              isPlayer1 ? "player1" : "player2",
            );
            if (paddleElement) {
              const paddleRect = paddleElement.getBoundingClientRect();
              const tableRect = tableElement.getBoundingClientRect();
              paddleHeightPercent =
                (paddleRect.height / tableRect.height) * 100;
            }
          }

          const buffer = 0.5;
          const minY = paddleHeightPercent / 2 - buffer;
          const maxY = 100 - paddleHeightPercent / 2 + buffer;

          const safeY = Math.max(minY, Math.min(maxY, player.y));

          return (
            <div
              key={id}
              id={isPlayer1 ? "player1" : "player2"}
              style={{
                position: "absolute",
                top: `${safeY}%`,
                left: `${isPlayer1 ? "5%" : "95%"}`,
                transform: "translate(-50%, -50%)",
              }}
            />
          );
        })}

        <div id="line"></div>
        <div id="scored">{gameState.score ? gameState.score[0] : 0}</div>
        <div id="conceded">{gameState.score ? gameState.score[1] : 0}</div>
      </div>
    </div>
  );
}

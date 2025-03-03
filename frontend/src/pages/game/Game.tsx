import { useState } from "react";
import { useApi } from "../../utils/api";
import { CreateGameDto, CreateGameDtoStatusEnum } from "../../generated-api";
import { v4 as uuidv4 } from "uuid";

const Game = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const api = useApi();

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
        "Game created successfully! roomId: " +
          createGameDto.roomIdentifier +
          " Waiting for opponent...",
      );
    } catch (error) {
      setMessage("Failed to create game. You might already be in a game.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="game-container">
      <h1>Game Page</h1>
      <button onClick={handleCreateGame} disabled={isLoading}>
        {isLoading ? "Creating..." : "Create New Game"}
      </button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default Game;

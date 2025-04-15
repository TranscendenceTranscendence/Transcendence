import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "@/utils/api";
import "./Queue.css";

const Queue = () => {
  const [searchTime, setSearchTime] = useState(0);
  const navigate = useNavigate();
  const api = useApi();

  useEffect(() => {
    const checkCurrentGame = async () => {
      try {
        const response = await api.Games.gamesControllerFindCurrentGame();
        if (response)
        {
          navigate(`/game`);
          return true;
        }
        return false;
      } catch (error) {
        console.error("Error checking current game:", error);
        return false;
      }
    };

    const handleJoinQueue = async () => {
      try {
        const response = await api.Queues.
      }
    }


    setInterval(() => {
      checkCurrentGame();
    }, 1000);
    });
    return () => {
    }
  }, [navigate, api];

  return (
    <div className="queue-page">
      <div className="queue-header">
        <h1>Pong Matchmaking</h1>
      </div>

      <div className="queue-content">
        {error && <div className="error-message">{error}</div>}

        <div className="queue-card">
          {inQueue ? (
            <>
              <div className="queue-info">
                <h2>Searching for opponent...</h2>
                <div className="search-time">{formatTime(searchTime)}</div>
                <div className="queue-position">
                  Position in queue: {queuePosition}
                </div>
                <div className="queue-spinner"></div>
              </div>
              <button className="leave-queue-btn" onClick={handleLeaveQueue}>
                Cancel Search
              </button>
            </>
          ) : (
            <>
              <div className="queue-info">
                <h2>Ready to Play?</h2>
                <p>Click below to find a match against another player.</p>
              </div>
              <button className="join-queue-btn" onClick={handleJoinQueue}>
                Find Match
              </button>
            </>
          )}
        </div>

        {message && <div className="status-message">{message}</div>}
      </div>
    </div>
  );
};

export default Queue;

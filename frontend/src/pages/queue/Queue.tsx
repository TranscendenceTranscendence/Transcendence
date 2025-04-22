import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "@/utils/api";
import "./Queue.css";

const Queue = () => {
  const [inQueue, setInQueue] = useState(false);
  const [searchTime, setSearchTime] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const api = useApi();

  const formatTime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    const isUserAlreadyInQueue = async () => {
      try {
        const response = await api.Queue.queueControllerIsInQueue();
        if (response && response.isInQueue) {
          setInQueue(true);
        } else {
          setInQueue(false);
        }
      } catch {
        console.error("Error checking if user is in queue:", error);
        setError("Error checking queue status");
      }
    };

    isUserAlreadyInQueue();
  }, []);

  const handleJoinQueue = async () => {
    try {
      const response = await api.Queue.queueControllerJoinQueue();
      if (response && response.success) {
        setInQueue(true);
        setMessage("Joined queue successfully");
      } else {
        setError("Failed to join queue");
      }
    } catch (error) {
      console.error("Error joining queue:", error);
      setError("Error joining queue");
    }
  };

  const handleLeaveQueue = async () => {
    try {
      const response = await api.Queue.queueControllerLeaveQueue();
      if (response && response.success) {
        setInQueue(false);
        setSearchTime(0);
        setMessage("Left queue successfully");
      } else {
        setError("Failed to leave queue");
      }
    } catch (error) {
      console.error("Error leaving queue:", error);
      setError("Error leaving queue");
    }
  };

  useEffect(() => {
    const checkCurrentGame = async () => {
      try {
        const response = await api.Games.gamesControllerFindCurrentGame();
        if (response.id !== undefined) {
          navigate(`/game`);
          return true;
        }
        return false;
      } catch (error) {
        console.error("Error checking current game:", error);
        return false;
      }
    };

    const checkQueueStatus = async () => {
      try {
        const inQueue = await api.Queue.queueControllerIsInQueue();
        if (inQueue && inQueue.isInQueue) {
          setInQueue(true);
        } else {
          setInQueue(false);
        }

        const response = await api.Queue.queueControllerGetQueueStatus();
        console.log("Queue status response:", response);
        if (response) {
          if (response.message === "Pair found in queue") {
            navigate(`/game`);
          } else {
            setSearchTime(response.secondsInQueue || 0);
          }
        }
      } catch (error) {
        console.error("Error checking queue status:", error);
      }
    };

    const interval = setInterval(() => {
      console.log("Checking for current game...");
      checkCurrentGame().then((hasGame) => {
        if (!hasGame && inQueue) {
          checkQueueStatus();
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [navigate, api, inQueue]);

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

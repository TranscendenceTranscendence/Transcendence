import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export function GameSettings() {
  const [showSettings, setShowSettings] = useState(false);
  const navigate = useNavigate();

  const handleLeaveGame = () => {
    if (confirm("Are you sure you want to leave the game?")) {
      navigate("/matchmaking");
    }
  };

  return (
    <div className="game-settings">
      <button
        className="settings-toggle"
        onClick={() => setShowSettings(!showSettings)}
      >
        {showSettings ? "✕" : "⚙️"}
      </button>

      {showSettings && (
        <div className="settings-panel">
          <h3>Game Settings</h3>

          <div className="settings-option">
            <button className="leave-game" onClick={handleLeaveGame}>
              Leave Game
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default GameSettings;

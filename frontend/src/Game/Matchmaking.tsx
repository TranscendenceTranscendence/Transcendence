import React, { useState } from 'react';
import axios from 'axios';
import './Matchmaking.css';

export default function MatchMaking() {
    const [playerId, setPlayerId] = useState('');
    const [message, setMessage] = useState('');
    const [gameStarted, setGameStarted] = useState(false);

    const joinQueue = async () => {
        try {
            if (playerId === '') {
                setMessage("Player ID can't be empty!");
                return;
            }
            const response = await axios.post('https://localhost:3000/queue/join', { playerId });
            if (response.data !== "") {
                console.log("You matched with an opponent!");
                const gameResponse = await axios.post('https://localhost:3000/games', {
                    player1_user_id: 1,
                    player2_user_id: 2,
                    winner_user_id: 2,
                    is_ladder_game: false,
                });
                console.log("Game created:", gameResponse.data);
                setMessage(`Game created: ${gameResponse.data}`);
                setGameStarted(true);
            } else {
                setMessage(`${playerId} was added to the queue`);
            }
        } catch (error) {
            setMessage('Error joining queue/match.');
        }
    };

    return (
        <>
            {!gameStarted && (
                <>
                    <h1>Matchmaking</h1>
                    <input
                        type="text"
                        value={playerId}
                        onChange={(e) => setPlayerId(e.target.value)}
                        placeholder="Enter Player ID"
                    />
                    <button onClick={joinQueue}>Join Queue</button>
                    {message && <p>{message}</p>}
                </>
            )}
        </>
    );
}

import React, { useEffect, useRef, useState } from "react";
import "./Game.css";

const Game: React.FC = () => {
  const [scored, setScored] = useState(0);
  const [conceded, setConceded] = useState(0);
  const ballRef = useRef<HTMLDivElement | null>(null);
  const player1Ref = useRef<HTMLDivElement | null>(null);
  const player2Ref = useRef<HTMLDivElement | null>(null);
  const tableRef = useRef<HTMLDivElement | null>(null);

  const speedXRef = useRef(1.5);
  const speedYRef = useRef(1.5);
  const ballXRef = useRef(0);
  const ballYRef = useRef(0);

  useEffect(() => {
    const ballElement = ballRef.current;
    const tableElement = tableRef.current;

    if (ballElement && tableElement) {
      const ballRect = ballElement.getBoundingClientRect();
      // const tableRect = tableElement.getBoundingClientRect();
      ballXRef.current = ballRect.left;
      ballYRef.current = ballRect.top;

      const moveBall = () => {
        const tableElement = tableRef.current;
        const ballElement = ballRef.current;
        const player1Element = player1Ref.current;
        const player2Element = player2Ref.current;

        if (!tableElement || !ballElement || !player1Element || !player2Element)
          return;

        const tableRect = tableElement.getBoundingClientRect();
        const player1Rect = player1Element.getBoundingClientRect();
        const player2Rect = player2Element.getBoundingClientRect();

        ballXRef.current -= speedXRef.current;
        ballYRef.current -= speedYRef.current;

        // Wall collision
        if (
          ballYRef.current <= tableRect.top ||
          ballYRef.current >= tableRect.bottom - ballElement.offsetHeight
        ) {
          speedYRef.current = -speedYRef.current;
        }

        // Paddle collision
        if (
          ballXRef.current <= player1Rect.right &&
          ballYRef.current >= player1Rect.top &&
          ballYRef.current <= player1Rect.bottom
        ) {
          speedXRef.current = -speedXRef.current;
        }
        if (
          ballXRef.current >= player2Rect.left - ballElement.offsetWidth &&
          ballYRef.current >= player2Rect.top &&
          ballYRef.current <= player2Rect.bottom
        ) {
          speedXRef.current = -speedXRef.current;
        }

        // Scoring
        if (ballXRef.current <= tableRect.left) {
          setConceded((prev) => prev + 1);
          resetBallPosition();
        } else if (
          ballXRef.current >=
          tableRect.right - ballElement.offsetWidth
        ) {
          setScored((prev) => prev + 1);
          resetBallPosition();
        }

        ballElement.style.left = `${ballXRef.current}px`;
        ballElement.style.top = `${ballYRef.current}px`;
      };

      const moveBallInterval = setInterval(moveBall, 1);
      document.addEventListener("mousemove", handleMouseMove);

      return () => {
        clearInterval(moveBallInterval);
        document.removeEventListener("mousemove", handleMouseMove);
      };
    }
  }, []);

  const handleMouseMove = (event: MouseEvent) => {
    if (player1Ref.current && tableRef.current) {
      const tableRect = tableRef.current.getBoundingClientRect();
      const newTop = event.pageY - player1Ref.current.offsetHeight / 2;

      if (
        newTop >= tableRect.top &&
        newTop + player1Ref.current.offsetHeight <= tableRect.bottom
      ) {
        player1Ref.current.style.position = "absolute";
        player1Ref.current.style.top = `${newTop}px`;
      } else if (newTop + player1Ref.current.offsetHeight > tableRect.bottom) {
        player1Ref.current.style.position = "absolute";
        player1Ref.current.style.top = `${tableRect.bottom - player1Ref.current.offsetHeight}px`;
      } else if (newTop < tableRect.top) {
        player1Ref.current.style.position = "absolute";
        player1Ref.current.style.top = `${tableRect.top}px`;
      }
    }
  };

  const resetBallPosition = () => {
    if (ballRef.current && tableRef.current) {
      const ballRect = ballRef.current.getBoundingClientRect();
      ballXRef.current = tableRef.current.clientWidth / 2 - ballRect.width / 2;
      ballYRef.current =
        tableRef.current.clientHeight / 2 - ballRect.height / 2;
      speedXRef.current = 1.5;
      speedYRef.current = 1.5;
    }
  };

  return (
    <div id="table" ref={tableRef}>
      <div id="player1" ref={player1Ref}></div>
      <div id="line"></div>
      <div id="player2" ref={player2Ref}></div>
      <div id="ball" ref={ballRef}></div>
      <div id="scored">{scored}</div>
      <div id="conceded">{conceded}</div>
    </div>
  );
};

export default Game;

const { parentPort } = require("worker_threads");

let ball = { x: 300, y: 200, vx: 2, vy: 2 };
let players = { p1: 150, p2: 150 }
let running = false;

function updateGameState() {
  if (!running) return;
  ball.x += ball.vx;
  ball.y += ball.vy;

  // Collision detection (simple version)
  if (ball.y <= 0 || ball.y >= 400) ball.vy *= -1; // Bounce off walls

  // Send updated state to the server
  if (parentPort) parentPort.postMessage({ ball, players });

  setTimeout(updateGameState, 16); // Approx 60 FPS
}

if (parentPort) {
  parentPort.on("message", (message) => {
    if (message.type === "startGame") {
      running = true;
      updateGameState();
    }
    if (message.type === "playerMove") {
      players[message.data.player] = message.datay;
    }
  });
}
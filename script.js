const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const playerScoreEl = document.getElementById('playerScore');
const computerScoreEl = document.getElementById('computerScore');

const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const PADDLE_WIDTH = 14;
const PADDLE_HEIGHT = 100;
const BALL_RADIUS = 8;
const PADDLE_SPEED = 440;
const COMPUTER_SPEED = 330;

const leftPaddle = {
  x: 20,
  y: HEIGHT / 2 - PADDLE_HEIGHT / 2,
  width: PADDLE_WIDTH,
  height: PADDLE_HEIGHT,
  speed: 0,
};

const rightPaddle = {
  x: WIDTH - 20 - PADDLE_WIDTH,
  y: HEIGHT / 2 - PADDLE_HEIGHT / 2,
  width: PADDLE_WIDTH,
  height: PADDLE_HEIGHT,
  speed: 0,
};

const ball = {
  x: WIDTH / 2,
  y: HEIGHT / 2,
  radius: BALL_RADIUS,
  velocityX: 320,
  velocityY: 180,
};

let playerScore = 0;
let computerScore = 0;
let lastTime = 0;
const keys = {
  ArrowUp: false,
  ArrowDown: false,
};

function resetBall(direction = 1) {
  ball.x = WIDTH / 2;
  ball.y = HEIGHT / 2;
  ball.velocityX = 320 * direction;
  ball.velocityY = (Math.random() > 0.5 ? 1 : -1) * (140 + Math.random() * 80);
}

function updateScoreboard() {
  playerScoreEl.textContent = playerScore;
  computerScoreEl.textContent = computerScore;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function handleInput(delta) {
  if (keys.ArrowUp) {
    leftPaddle.y -= PADDLE_SPEED * delta;
  }
  if (keys.ArrowDown) {
    leftPaddle.y += PADDLE_SPEED * delta;
  }

  leftPaddle.y = clamp(leftPaddle.y, 0, HEIGHT - leftPaddle.height);
}

function moveComputer(delta) {
  const center = rightPaddle.y + rightPaddle.height / 2;
  if (ball.y < center - 12) {
    rightPaddle.y -= COMPUTER_SPEED * delta;
  } else if (ball.y > center + 12) {
    rightPaddle.y += COMPUTER_SPEED * delta;
  }
  rightPaddle.y = clamp(rightPaddle.y, 0, HEIGHT - rightPaddle.height);
}

function handleBallCollisions() {
  if (ball.y - ball.radius <= 0) {
    ball.y = ball.radius;
    ball.velocityY *= -1;
  } else if (ball.y + ball.radius >= HEIGHT) {
    ball.y = HEIGHT - ball.radius;
    ball.velocityY *= -1;
  }

  const leftHit =
    ball.x - ball.radius <= leftPaddle.x + leftPaddle.width &&
    ball.x + ball.radius >= leftPaddle.x &&
    ball.y >= leftPaddle.y &&
    ball.y <= leftPaddle.y + leftPaddle.height;

  if (leftHit) {
    ball.x = leftPaddle.x + leftPaddle.width + ball.radius;
    ball.velocityX = Math.abs(ball.velocityX) + 20;
    const relativeIntersectY = (ball.y - (leftPaddle.y + leftPaddle.height / 2)) / (leftPaddle.height / 2);
    ball.velocityY = relativeIntersectY * 240;
  }

  const rightHit =
    ball.x + ball.radius >= rightPaddle.x &&
    ball.x - ball.radius <= rightPaddle.x + rightPaddle.width &&
    ball.y >= rightPaddle.y &&
    ball.y <= rightPaddle.y + rightPaddle.height;

  if (rightHit) {
    ball.x = rightPaddle.x - ball.radius;
    ball.velocityX = -Math.abs(ball.velocityX) - 20;
    const relativeIntersectY = (ball.y - (rightPaddle.y + rightPaddle.height / 2)) / (rightPaddle.height / 2);
    ball.velocityY = relativeIntersectY * 240;
  }
}

function update(delta) {
  handleInput(delta);
  moveComputer(delta);

  ball.x += ball.velocityX * delta;
  ball.y += ball.velocityY * delta;
  handleBallCollisions();

  if (ball.x - ball.radius < 0) {
    computerScore += 1;
    updateScoreboard();
    resetBall(1);
    return;
  }

  if (ball.x + ball.radius > WIDTH) {
    playerScore += 1;
    updateScoreboard();
    resetBall(-1);
  }
}

function draw() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.strokeStyle = '#f8fafc';
  ctx.setLineDash([10, 8]);
  ctx.beginPath();
  ctx.moveTo(WIDTH / 2, 0);
  ctx.lineTo(WIDTH / 2, HEIGHT);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(leftPaddle.x, leftPaddle.y, leftPaddle.width, leftPaddle.height);
  ctx.fillRect(rightPaddle.x, rightPaddle.y, rightPaddle.width, rightPaddle.height);

  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = '#fb923c';
  ctx.fill();
}

function gameLoop(timestamp) {
  if (!lastTime) lastTime = timestamp;
  const delta = (timestamp - lastTime) / 1000;
  lastTime = timestamp;

  update(delta);
  draw();
  requestAnimationFrame(gameLoop);
}

canvas.addEventListener('mousemove', (event) => {
  const rect = canvas.getBoundingClientRect();
  const mouseY = event.clientY - rect.top;
  leftPaddle.y = clamp(mouseY - leftPaddle.height / 2, 0, HEIGHT - leftPaddle.height);
});

document.addEventListener('keydown', (event) => {
  if (event.key in keys) {
    keys[event.key] = true;
    event.preventDefault();
  }
});

document.addEventListener('keyup', (event) => {
  if (event.key in keys) {
    keys[event.key] = false;
    event.preventDefault();
  }
});

updateScoreboard();
resetBall(1);
requestAnimationFrame(gameLoop);

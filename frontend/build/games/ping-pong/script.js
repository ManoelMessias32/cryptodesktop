// Initialize canvas
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

// Buttons
var startBtn = document.getElementById("start-btn");
var pauseBtn = document.getElementById("pause-btn");
var restartBtn = document.getElementById("restart-btn");
var moveUpBtn = document.getElementById("move-up-btn");
var moveDownBtn = document.getElementById("move-down-btn");

var animationId;
var gameRunning = false;

// Game state properties
let leftPlayerScore = 0;
let rightPlayerScore = 0;
const maxScore = 10;

// Ball properties
const ballRadius = 10;
let ballX = canvas.width / 2;
let ballY = canvas.height / 2;
let ballSpeedX = 5;
let ballSpeedY = 5;

// Paddle properties
const paddleHeight = 80;
const paddleWidth = 10;
const paddleSpeed = 10;
let leftPaddleY = canvas.height / 2 - paddleHeight / 2;
let rightPaddleY = canvas.height / 2 - paddleHeight / 2;

// Key and Touch state
let moveUp = false;
let moveDown = false;

// Event Listeners
startBtn.addEventListener("click", () => { if (!gameRunning) { gameRunning = true; loop(); } });
pauseBtn.addEventListener("click", () => { gameRunning = false; cancelAnimationFrame(animationId); });
restartBtn.addEventListener("click", () => document.location.reload());

// Keyboard controls
document.addEventListener("keydown", e => {
    if (e.key === "w" || e.key === "W" || e.key === "ArrowUp") moveUp = true;
    if (e.key === "s" || e.key === "S" || e.key === "ArrowDown") moveDown = true;
});
document.addEventListener("keyup", e => {
    if (e.key === "w" || e.key === "W" || e.key === "ArrowUp") moveUp = false;
    if (e.key === "s" || e.key === "S" || e.key === "ArrowDown") moveDown = false;
});

// Touch controls
moveUpBtn.addEventListener("touchstart", e => { e.preventDefault(); moveUp = true; });
moveUpBtn.addEventListener("touchend", e => { e.preventDefault(); moveUp = false; });
moveDownBtn.addEventListener("touchstart", e => { e.preventDefault(); moveDown = true; });
moveDownBtn.addEventListener("touchend", e => { e.preventDefault(); moveDown = false; });

window.addEventListener("load", draw);

function update() {
    // Move left paddle (player)
    if (moveUp && leftPaddleY > 0) {
        leftPaddleY -= paddleSpeed;
    }
    if (moveDown && leftPaddleY + paddleHeight < canvas.height) {
        leftPaddleY += paddleSpeed;
    }

    // AI for right paddle
    const rightPaddleCenter = rightPaddleY + paddleHeight / 2;
    if (rightPaddleCenter < ballY - 10 && rightPaddleY + paddleHeight < canvas.height) {
        rightPaddleY += paddleSpeed * 0.8;
    } else if (rightPaddleCenter > ballY + 10 && rightPaddleY > 0) {
        rightPaddleY -= paddleSpeed * 0.8;
    }

    // (Resto da função update, draw, loop, etc. permanece o mesmo)
    ballX += ballSpeedX;
    ballY += ballSpeedY;

    if (ballY - ballRadius < 0 || ballY + ballRadius > canvas.height) {
        ballSpeedY = -ballSpeedY;
    }

    if (ballX - ballRadius < paddleWidth && ballY > leftPaddleY && ballY < leftPaddleY + paddleHeight) {
        ballSpeedX = -ballSpeedX;
        ballSpeedX *= 1.05;
        ballSpeedY *= 1.05;
    }
    if (ballX + ballRadius > canvas.width - paddleWidth && ballY > rightPaddleY && ballY < rightPaddleY + paddleHeight) {
        ballSpeedX = -ballSpeedX;
    }

    if (ballX - ballRadius < 0) {
        rightPlayerScore++;
        resetBall();
    } else if (ballX + ballRadius > canvas.width) {
        leftPlayerScore++;
        resetBall();
    }

    if (leftPlayerScore === maxScore) {
        playerWin("You");
        window.parent.postMessage('gameWon', '*');
    } else if (rightPlayerScore === maxScore) {
        playerWin("Computer");
    }
}

function playerWin(player) {
    gameRunning = false;
    const message = player === "You" ? "Parabéns, você venceu!" : "O computador venceu.";
    $("#message").text(message);
    $("#message-modal").modal("show");
}

function resetBall() {
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
    ballSpeedX = (ballSpeedX > 0) ? -5 : 5;
    ballSpeedY = Math.random() > 0.5 ? 5 : -5;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#FFF";
    ctx.beginPath();
    ctx.setLineDash([5, 15]);
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.strokeStyle = "#FFF";
    ctx.stroke();
    ctx.closePath();
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
    ctx.fillRect(0, leftPaddleY, paddleWidth, paddleHeight);
    ctx.fillRect(canvas.width - paddleWidth, rightPaddleY, paddleWidth, paddleHeight);
    ctx.font = "20px Arial";
    ctx.fillText(leftPlayerScore.toString(), canvas.width / 2 - 50, 30);
    ctx.fillText(rightPlayerScore.toString(), canvas.width / 2 + 30, 30);
}

function loop() {
    if (!gameRunning) return;
    update();
    draw();
    animationId = requestAnimationFrame(loop);
}

$("#message-modal-close").on("click", function () {
    leftPlayerScore = 0;
    rightPlayerScore = 0;
    gameRunning = false;
    resetBall();
    draw();
    $('#message-modal').modal('hide');
});

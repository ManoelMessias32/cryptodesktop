// Initialize canvas
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

// Buttons
var startBtn = document.getElementById("start-btn");
var pauseBtn = document.getElementById("pause-btn");
var restartBtn = document.getElementById("restart-btn");

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
const playerPaddleSpeed = 30; // Increased speed for better response
const opponentPaddleSpeed = 20;
let leftPaddleY = canvas.height / 2 - paddleHeight / 2;
let rightPaddleY = canvas.height / 2 - paddleHeight / 2;

// Game start function
function startGame() {
    if (!gameRunning) {
        gameRunning = true;
        loop();
    }
}

// Event Listeners
startBtn.addEventListener("click", startGame);
pauseBtn.addEventListener("click", () => { gameRunning = false; cancelAnimationFrame(animationId); });
restartBtn.addEventListener("click", () => document.location.reload());

// D-pad controls from the main application
window.addEventListener('message', function(event) {
    if (gameRunning) {
        if (event.data === 'up') {
            leftPaddleY -= playerPaddleSpeed;
        } else if (event.data === 'down') {
            leftPaddleY += playerPaddleSpeed;
        }
    }
    if (event.data === 'action') {
        startGame();
    }
});

window.addEventListener("load", draw);

function update() {
    // AI for right paddle
    const rightPaddleCenter = rightPaddleY + paddleHeight / 2;
    if (rightPaddleCenter < ballY - 10 && rightPaddleY + paddleHeight < canvas.height) {
        rightPaddleY += opponentPaddleSpeed * 0.4; // Reduced speed for fairness
    } else if (rightPaddleCenter > ballY + 10 && rightPaddleY > 0) {
        rightPaddleY -= opponentPaddleSpeed * 0.4; // Reduced speed for fairness
    }

    ballX += ballSpeedX;
    ballY += ballSpeedY;

    if (ballY - ballRadius < 0 || ballY + ballRadius > canvas.height) {
        ballSpeedY = -ballSpeedY;
    }

    if (ballX - ballRadius < paddleWidth && ballY > leftPaddleY && ballY < leftPaddleY + paddleHeight) {
        ballSpeedX = -ballSpeedX;
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
        playerWin("Você");
        window.parent.postMessage('gameWon', '*');
    } else if (rightPlayerScore === maxScore) {
        playerWin("Computador");
    }
}

function playerWin(player) {
    gameRunning = false;
    const message = player === "Você" ? "Parabéns, você venceu!" : "O computador venceu.";
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

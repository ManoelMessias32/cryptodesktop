const playBoard = document.querySelector(".play-board");
const scoreElement = document.querySelector(".score");
const highScoreElement = document.querySelector(".high-score");

let gameOver = false;
let foodX, foodY;
let snakeX = 5, snakeY = 5;
let velocityX = 0, velocityY = 0;
let snakeBody = [];
let setIntervalId;
let score = 0;

// Velocidade inicial mais lenta (de 100 para 150)
let gameSpeed = 150; 

let highScore = localStorage.getItem("high-score") || 0;
highScoreElement.innerText = `Pontuação Máxima: ${highScore}`;

const updateFoodPosition = () => {
    foodX = Math.floor(Math.random() * 30) + 1;
    foodY = Math.floor(Math.random() * 30) + 1;
}

const handleGameOver = () => {
    clearInterval(setIntervalId);
    alert("Fim de Jogo! Pressione OK para jogar novamente...");
    location.reload();
}

const changeDirection = e => {
    const key = e.key;
    if((key === "ArrowUp" || key.toLowerCase() === 'w') && velocityY != 1) {
        velocityX = 0;
        velocityY = -1;
    } else if((key === "ArrowDown" || key.toLowerCase() === 's') && velocityY != -1) {
        velocityX = 0;
        velocityY = 1;
    } else if((key === "ArrowLeft" || key.toLowerCase() === 'a') && velocityX != 1) {
        velocityX = -1;
        velocityY = 0;
    } else if((key === "ArrowRight" || key.toLowerCase() === 'd') && velocityX != -1) {
        velocityX = 1;
        velocityY = 0;
    }
}

window.addEventListener('message', function(event) {
    const keyMap = { 'up': "ArrowUp", 'down': "ArrowDown", 'left': "ArrowLeft", 'right': "ArrowRight" };
    const key = keyMap[event.data];
    if (key) changeDirection({ key: key });
});

const initGame = () => {
    if(gameOver) return handleGameOver();
    let html = `<div class="food" style="grid-area: ${foodY} / ${foodX}"></div>`;

    if(snakeX === foodX && snakeY === foodY) {
        window.parent.postMessage('gameWon', '*'); 
        updateFoodPosition();
        snakeBody.push([foodY, foodX]);
        score++; 
        highScore = score >= highScore ? score : highScore;
        localStorage.setItem("high-score", highScore);
        scoreElement.innerText = `Pontuação: ${score}`;
        highScoreElement.innerText = `Pontuação Máxima: ${highScore}`;
    }

    // Move o corpo da cobra
    for (let i = snakeBody.length - 1; i > 0; i--) {
        snakeBody[i] = snakeBody[i - 1];
    }
    // Atualiza a cabeça da cobra com a nova posição
    snakeBody[0] = [snakeX, snakeY];

    snakeX += velocityX;
    snakeY += velocityY;
    
    if(snakeX <= 0 || snakeX > 30 || snakeY <= 0 || snakeY > 30) {
        return gameOver = true;
    }

    // Renderiza a cobra e a comida
    for (let i = 0; i < snakeBody.length; i++) {
        html += `<div class="head" style="grid-area: ${snakeBody[i][1]} / ${snakeBody[i][0]}"></div>`;
        // Verifica a colisão com o corpo
        if (i !== 0 && snakeBody[0][1] === snakeBody[i][1] && snakeBody[0][0] === snakeBody[i][0]) {
            gameOver = true;
        }
    }
    playBoard.innerHTML = html;
}

updateFoodPosition();
setIntervalId = setInterval(initGame, gameSpeed);
document.addEventListener("keyup", changeDirection);

document.addEventListener("DOMContentLoaded", () => {
    candyCrushGame();
});

function candyCrushGame() {
    // DOM Elements
    const grid = document.querySelector(".grid");
    const scoreDisplay = document.getElementById("score");
    
    // Game Config
    const width = 8;
    const SCORE_TO_WIN = 100; // <<<--- OBJETIVO DE PONTUAÇÃO
    const squares = [];

    // Game State
    let score = 0;
    let isGameOver = false;

    const candyColors = [
        "url(https://raw.githubusercontent.com/arpit456jain/Amazing-Js-Projects/master/Candy%20Crush/utils/red-candy.png)",
        "url(https://raw.githubusercontent.com/arpit456jain/Amazing-Js-Projects/master/Candy%20Crush/utils/blue-candy.png)",
        "url(https://raw.githubusercontent.com/arpit456jain/Amazing-Js-Projects/master/Candy%20Crush/utils/green-candy.png)",
        "url(https://raw.githubusercontent.com/arpit456jain/Amazing-Js-Projects/master/Candy%20Crush/utils/yellow-candy.png)",
        "url(https://raw.githubusercontent.com/arpit456jain/Amazing-Js-Projects/master/Candy%20Crush/utils/orange-candy.png)",
        "url(https://raw.githubusercontent.com/arpit456jain/Amazing-Js-Projects/master/Candy%20Crush/utils/purple-candy.png)",
    ];

    function createBoard() {
        grid.style.display = "flex"; // Garante que o grid seja visível
        for (let i = 0; i < width * width; i++) {
            const square = document.createElement("div");
            square.setAttribute("draggable", true);
            square.setAttribute("id", i);
            let randomColor = Math.floor(Math.random() * candyColors.length);
            square.style.backgroundImage = candyColors[randomColor];
            grid.appendChild(square);
            squares.push(square);
        }
    }

    // --- Drag and Drop Logic ---
    let colorBeingDragged, colorBeingReplaced, squareIdBeingDragged, squareIdBeingReplaced;

    function dragStart() {
        if (isGameOver) return;
        colorBeingDragged = this.style.backgroundImage;
        squareIdBeingDragged = parseInt(this.id);
    }

    function dragDrop() {
        if (isGameOver) return;
        colorBeingReplaced = this.style.backgroundImage;
        squareIdBeingReplaced = parseInt(this.id);
        this.style.backgroundImage = colorBeingDragged;
        squares[squareIdBeingDragged].style.backgroundImage = colorBeingReplaced;
    }

    function dragEnd() {
        if (isGameOver) return;
        let validMoves = [ squareIdBeingDragged - 1, squareIdBeingDragged - width, squareIdBeingDragged + 1, squareIdBeingDragged + width ];
        let validMove = validMoves.includes(squareIdBeingReplaced);

        if (squareIdBeingReplaced && validMove) {
            squareIdBeingReplaced = null; // Movimento válido, resetar
        } else if (squareIdBeingReplaced && !validMove) { // Movimento inválido, reverter
            squares[squareIdBeingReplaced].style.backgroundImage = colorBeingReplaced;
            squares[squareIdBeingDragged].style.backgroundImage = colorBeingDragged;
        } else { // Soltou em um local inválido
            squares[squareIdBeingDragged].style.backgroundImage = colorBeingDragged;
        }
    }

    // --- Game Mechanics ---

    function moveIntoSquareBelow() {
        for (let i = 0; i < width * (width - 1); i++) {
            if (squares[i + width].style.backgroundImage === "") {
                squares[i + width].style.backgroundImage = squares[i].style.backgroundImage;
                squares[i].style.backgroundImage = "";
            }
        }
        for (let i = 0; i < width; i++) {
            if (squares[i].style.backgroundImage === "") {
                let randomColor = Math.floor(Math.random() * candyColors.length);
                squares[i].style.backgroundImage = candyColors[randomColor];
            }
        }
    }

    // --- Win/Scoring Logic ---

    function checkWinCondition() {
        if (score >= SCORE_TO_WIN && !isGameOver) {
            isGameOver = true;
            window.parent.postMessage('gameWon', '*'); // Envia a mensagem de vitória
            scoreDisplay.innerHTML = `VOCÊ VENCEU!`;
            // Impede que os doces sejam arrastados
            squares.forEach(square => square.setAttribute("draggable", false)); 
        }
    }

    function handleMatch(count) {
        score += count;
        scoreDisplay.innerHTML = score;
    }

    // --- Check for Matches ---
    function checkMatches(forLength) {
        let pointsFound = 0;
        // Check Rows
        for (let i = 0; i < width * width; i++) {
            const row = [];
            for (let j = 0; j < forLength; j++) {
                if (i % width + j < width) row.push(i + j);
            }
            if (row.length !== forLength) continue;

            let decidedColor = squares[row[0]].style.backgroundImage;
            if (decidedColor === "") continue;

            if (row.every(index => squares[index].style.backgroundImage === decidedColor)) {
                pointsFound += forLength;
                row.forEach(index => squares[index].style.backgroundImage = "");
            }
        }
        // Check Columns
        for (let i = 0; i < width * (width - (forLength - 1)); i++) {
            const column = [];
            for (let j = 0; j < forLength; j++) {
                column.push(i + j * width);
            }

            let decidedColor = squares[column[0]].style.backgroundImage;
            if (decidedColor === "") continue;

            if (column.every(index => squares[index].style.backgroundImage === decidedColor)) {
                pointsFound += forLength;
                column.forEach(index => squares[index].style.backgroundImage = "");
            }
        }

        if (pointsFound > 0) handleMatch(pointsFound);
    }

    // --- Game Loop ---
    function gameLoop() {
        if (isGameOver) return;
        checkMatches(5);
        checkMatches(4);
        checkMatches(3);
        moveIntoSquareBelow();
        checkWinCondition();
    }

    // --- Main Function ---
    function startGame() {
        createBoard();
        score = 0;
        scoreDisplay.innerHTML = score;
        isGameOver = false;
        squares.forEach(square => {
            square.addEventListener("dragstart", dragStart);
            square.addEventListener("dragend", dragEnd);
            square.addEventListener("dragover", (e) => e.preventDefault());
            square.addEventListener("dragenter", (e) => e.preventDefault());
            square.addEventListener("dragleave", () => {});
            square.addEventListener("drop", dragDrop);
        });
        setInterval(gameLoop, 100);
    }

    startGame();
}

document.addEventListener("DOMContentLoaded", () => {
    candyCrushGame();
});

function candyCrushGame() {
    // DOM Elements
    const grid = document.querySelector(".grid");
    const scoreDisplay = document.getElementById("score");
    const levelDisplay = document.getElementById("level"); // Novo elemento para o nível
    
    // Game Config
    const width = 8;
    const squares = [];

    // Game State
    let score = 0;
    let currentLevel = 1;
    let scoreToWin = 100; // Meta inicial
    let isGameWon = false; // Controla se a recompensa já foi enviada

    const candyColors = [
        "url(https://raw.githubusercontent.com/arpit456jain/Amazing-Js-Projects/master/Candy%20Crush/utils/red-candy.png)",
        "url(https://raw.githubusercontent.com/arpit456jain/Amazing-Js-Projects/master/Candy%20Crush/utils/blue-candy.png)",
        "url(https://raw.githubusercontent.com/arpit456jain/Amazing-Js-Projects/master/Candy%20Crush/utils/green-candy.png)",
        "url(https://raw.githubusercontent.com/arpit456jain/Amazing-Js-Projects/master/Candy%20Crush/utils/yellow-candy.png)",
        "url(https://raw.githubusercontent.com/arpit456jain/Amazing-Js-Projects/master/Candy%20Crush/utils/orange-candy.png)",
        "url(https://raw.githubusercontent.com/arpit456jain/Amazing-Js-Projects/master/Candy%20Crush/utils/purple-candy.png)",
    ];

    function createBoard() {
        grid.style.display = "flex";
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

    // --- Lógica de Drag/Touch (permanece a mesma) ---
    let colorBeingDragged, colorBeingReplaced, squareIdBeingDragged, squareIdBeingReplaced;

    function dragStart() { if (isGameWon) return; colorBeingDragged = this.style.backgroundImage; squareIdBeingDragged = parseInt(this.id); }
    function dragDrop() { if (isGameWon) return; colorBeingReplaced = this.style.backgroundImage; squareIdBeingReplaced = parseInt(this.id); this.style.backgroundImage = colorBeingDragged; squares[squareIdBeingDragged].style.backgroundImage = colorBeingReplaced; }
    function dragEnd() { if (isGameWon) return; let validMoves = [squareIdBeingDragged - 1, squareIdBeingDragged - width, squareIdBeingDragged + 1, squareIdBeingDragged + width]; let validMove = validMoves.includes(squareIdBeingReplaced); if (squareIdBeingReplaced && validMove) { squareIdBeingReplaced = null; } else if (squareIdBeingReplaced && !validMove) { squares[squareIdBeingReplaced].style.backgroundImage = colorBeingReplaced; squares[squareIdBeingDragged].style.backgroundImage = colorBeingDragged; } else { squares[squareIdBeingDragged].style.backgroundImage = colorBeingDragged; } }
    function touchStart(e) { if (isGameWon) return; e.preventDefault(); squareIdBeingDragged = parseInt(this.id); colorBeingDragged = this.style.backgroundImage; }
    function touchMove(e) { if (isGameWon) return; e.preventDefault(); const touch = e.touches[0]; const element = document.elementFromPoint(touch.clientX, touch.clientY); if (element && element.parentElement === grid && squares.includes(element)) { squareIdBeingReplaced = parseInt(element.id); } }
    function touchEnd(e) { if (isGameWon || squareIdBeingDragged === null || squareIdBeingReplaced === null) return; e.preventDefault(); const validMoves = [squareIdBeingDragged - 1, squareIdBeingDragged - width, squareIdBeingDragged + 1, squareIdBeingDragged + width]; const isAValidMove = validMoves.includes(squareIdBeingReplaced); if (isAValidMove) { colorBeingReplaced = squares[squareIdBeingReplaced].style.backgroundImage; squares[squareIdBeingReplaced].style.backgroundImage = colorBeingDragged; squares[squareIdBeingDragged].style.backgroundImage = colorBeingReplaced; } squareIdBeingDragged = null; squareIdBeingReplaced = null; colorBeingDragged = null; colorBeingReplaced = null; }
    
    // --- Mecânicas do Jogo (permanece a mesma) ---
    function moveIntoSquareBelow() { for (let i = 0; i < width * (width - 1); i++) { if (squares[i + width].style.backgroundImage === "") { squares[i + width].style.backgroundImage = squares[i].style.backgroundImage; squares[i].style.backgroundImage = ""; } } for (let i = 0; i < width; i++) { if (squares[i].style.backgroundImage === "") { let randomColor = Math.floor(Math.random() * candyColors.length); squares[i].style.backgroundImage = candyColors[randomColor]; } } }

    // --- Lógica de Nível e Pontuação ---
    function updateScoreboard() {
        scoreDisplay.innerHTML = `Pontos: ${score} / ${scoreToWin}`;
        levelDisplay.innerHTML = `Nível: ${currentLevel}`;
    }

    function levelUp() {
        currentLevel++;
        // Aumenta a dificuldade. Ex: 100, 250, 450, 700...
        scoreToWin = 100 + (currentLevel - 1) * 150;
        updateScoreboard();
        
        // Envia a mensagem de vitória apenas na primeira vez
        if (!isGameWon) {
            isGameWon = true;
            window.parent.postMessage('gameWon', '*');
            // Mostra uma mensagem de vitória final, mas o jogo continua
            const finalWinMessage = document.createElement('div');
            finalWinMessage.textContent = 'RECOMPENSA ENVIADA!';
            finalWinMessage.style.cssText = `position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #28a745; color: white; padding: 20px; border-radius: 10px; z-index: 100;`;
            grid.appendChild(finalWinMessage);
            setTimeout(() => finalWinMessage.remove(), 3000); 
        }
    }

    function handleMatch(count) {
        if (isGameWon && score >= scoreToWin) return; // Não pontuar mais se já ganhou tudo
        score += count;
        updateScoreboard();
        if (score >= scoreToWin) {
            levelUp();
        }
    }

    // --- Verificação de Combinações (permanece a mesma) ---
    function checkMatches(forLength) { let pointsFound = 0; for (let i = 0; i < width * width; i++) { const row = []; for (let j = 0; j < forLength; j++) { if (i % width + j < width) row.push(i + j); } if (row.length !== forLength) continue; let decidedColor = squares[row[0]].style.backgroundImage; if (decidedColor === "") continue; if (row.every(index => squares[index].style.backgroundImage === decidedColor)) { pointsFound += forLength; row.forEach(index => squares[index].style.backgroundImage = ""); } } for (let i = 0; i < width * (width - (forLength - 1)); i++) { const column = []; for (let j = 0; j < forLength; j++) { column.push(i + j * width); } let decidedColor = squares[column[0]].style.backgroundImage; if (decidedColor === "") continue; if (column.every(index => squares[index].style.backgroundImage === decidedColor)) { pointsFound += forLength; column.forEach(index => squares[index].style.backgroundImage = ""); } } if (pointsFound > 0) handleMatch(pointsFound); }

    // --- Game Loop (simplificado) ---
    function gameLoop() {
        checkMatches(5);
        checkMatches(4);
        checkMatches(3);
        moveIntoSquareBelow();
    }

    // --- Função Principal ---
    function startGame() {
        createBoard();
        score = 0;
        currentLevel = 1;
        scoreToWin = 100;
        isGameWon = false;
        updateScoreboard(); // Atualiza o placar inicial

        squares.forEach(square => {
            // Eventos de Mouse e Toque
            square.addEventListener("dragstart", dragStart);
            square.addEventListener("dragend", dragEnd);
            square.addEventListener("dragover", (e) => e.preventDefault());
            square.addEventListener("dragenter", (e) => e.preventDefault());
            square.addEventListener("dragleave", () => {});
            square.addEventListener("drop", dragDrop);
            square.addEventListener("touchstart", touchStart, { passive: false });
            square.addEventListener("touchmove", touchMove, { passive: false });
            square.addEventListener("touchend", touchEnd, { passive: false });
        });
        setInterval(gameLoop, 100);
    }

    startGame();
}

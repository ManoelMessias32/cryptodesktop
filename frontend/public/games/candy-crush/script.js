document.addEventListener("DOMContentLoaded", () => {
    candyCrushGame();
});

function candyCrushGame() {
    const grid = document.querySelector(".grid");
    const scoreDisplay = document.getElementById("score");
    const levelDisplay = document.getElementById("level");
    const width = 8;
    const squares = [];
    let score = 0;
    let currentLevel = 1;
    let scoreToWin = 100;
    let isGameWon = false;

    const candyColors = [
        "url(https://raw.githubusercontent.com/arpit456jain/Amazing-Js-Projects/master/Candy%20Crush/utils/red-candy.png)",
        "url(https://raw.githubusercontent.com/arpit456jain/Amazing-Js-Projects/master/Candy%20Crush/utils/blue-candy.png)",
        "url(https://raw.githubusercontent.com/arpit456jain/Amazing-Js-Projects/master/Candy%20Crush/utils/green-candy.png)",
        "url(https://raw.githubusercontent.com/arpit456jain/Amazing-Js-Projects/master/Candy%20Crush/utils/yellow-candy.png)",
        "url(https://raw.githubusercontent.com/arpit456jain/Amazing-Js-Projects/master/Candy%20Crush/utils/orange-candy.png)",
        "url(https://raw.githubusercontent.com/arpit456jain/Amazing-Js-Projects/master/Candy%20Crush/utils/purple-candy.png)",
    ];

    function createBoard() {
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

    let colorBeingDragged, colorBeingReplaced, squareIdBeingDragged, squareIdBeingReplaced;

    function dragStart() { /* ... */ }
    function dragOver(e) { e.preventDefault(); }
    function dragEnter(e) { e.preventDefault(); }
    function dragLeave() { /* ... */ }
    
    function dragDrop() {
        if (isGameWon) return;
        colorBeingReplaced = this.style.backgroundImage;
        squareIdBeingReplaced = parseInt(this.id);
        this.style.backgroundImage = colorBeingDragged;
        squares[squareIdBeingDragged].style.backgroundImage = colorBeingReplaced;
    }

    function dragEnd() {
        if (isGameWon) return;
        let validMoves = [squareIdBeingDragged - 1, squareIdBeingDragged - width, squareIdBeingDragged + 1, squareIdBeingDragged + width];
        let validMove = validMoves.includes(squareIdBeingReplaced);

        if (squareIdBeingReplaced && validMove) {
            squareIdBeingReplaced = null;
        } else if (squareIdBeingReplaced && !validMove) {
            squares[squareIdBeingReplaced].style.backgroundImage = colorBeingReplaced;
            squares[squareIdBeingDragged].style.backgroundImage = colorBeingDragged;
        } else {
            squares[squareIdBeingDragged].style.backgroundImage = colorBeingDragged;
        }
    }

    // --- Touch Logic ---
    function touchStart(e) {
        if (isGameWon) return;
        e.preventDefault();
        squareIdBeingDragged = parseInt(this.id);
        colorBeingDragged = this.style.backgroundImage;
    }

    function touchMove(e) {
        if (isGameWon) return;
        e.preventDefault();
        const touch = e.touches[0];
        const element = document.elementFromPoint(touch.clientX, touch.clientY);
        if (element && squares.includes(element)) {
            squareIdBeingReplaced = parseInt(element.id);
        }
    }

    function touchEnd() {
        if (isGameWon || !squareIdBeingReplaced) return;
        // Simula o drop e o end
        dragDrop.call(squares[squareIdBeingReplaced]);
        dragEnd();
    }

    // (Resto do código: game mechanics, scoring, etc. permanece o mesmo)
    function moveIntoSquareBelow() { /*...*/ }
    function updateScoreboard() { /*...*/ }
    function levelUp() { /*...*/ }
    function handleMatch(count) { /*...*/ }
    function checkMatches(forLength) { /*...*/ }
    function gameLoop() { /*...*/ }

    function startGame() {
        createBoard();
        // ... (resto da inicialização)
        squares.forEach(square => {
            square.addEventListener('dragstart', dragStart);
            square.addEventListener('dragover', dragOver);
            square.addEventListener('dragenter', dragEnter);
            square.addEventListener('dragleave', dragLeave);
            square.addEventListener('drop', dragDrop);
            square.addEventListener('dragend', dragEnd);

            square.addEventListener('touchstart', touchStart, { passive: false });
            square.addEventListener('touchmove', touchMove, { passive: false });
            square.addEventListener('touchend', touchEnd, { passive: false });
        });
        setInterval(gameLoop, 100);
    }

    startGame();
}

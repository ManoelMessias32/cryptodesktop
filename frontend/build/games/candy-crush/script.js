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

    function dragStart() {
        colorBeingDragged = this.style.backgroundImage;
        squareIdBeingDragged = parseInt(this.id);
    }

    function dragOver(e) { e.preventDefault(); }
    function dragEnter(e) { e.preventDefault(); }
    function dragLeave() {}

    function dragDrop() {
        colorBeingReplaced = this.style.backgroundImage;
        squareIdBeingReplaced = parseInt(this.id);
        this.style.backgroundImage = colorBeingDragged;
        squares[squareIdBeingDragged].style.backgroundImage = colorBeingReplaced;
    }

    function dragEnd() {
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

    function touchStart(e) {
        e.preventDefault();
        squareIdBeingDragged = parseInt(this.id);
        colorBeingDragged = this.style.backgroundImage;
    }

    function touchMove(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const element = document.elementFromPoint(touch.clientX, touch.clientY);
        if (element && squares.includes(element)) {
            squareIdBeingReplaced = parseInt(element.id);
        } else {
            squareIdBeingReplaced = null;
        }
    }

    function touchEnd() {
        if (squareIdBeingReplaced !== null) {
            const squareToReplace = squares[squareIdBeingReplaced];
            dragDrop.call(squareToReplace);
            dragEnd();
        }
    }

    // ... (Resto do código como moveIntoSquareBelow, checkMatches, etc. permanece igual)
    function moveIntoSquareBelow(){}
    function updateScoreboard(){}
    function levelUp(){}
    function handleMatch(){}
    function checkMatches(){}
    function gameLoop(){}

    function startGame() {
        createBoard();
        score = 0;
        currentLevel = 1;
        scoreToWin = 100;
        isGameWon = false;
        updateScoreboard();

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

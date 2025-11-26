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

    function dragDrop() {
        colorBeingReplaced = this.style.backgroundImage;
        squareIdBeingReplaced = parseInt(this.id);
        squares[squareIdBeingDragged].style.backgroundImage = colorBeingReplaced;
        squares[squareIdBeingReplaced].style.backgroundImage = colorBeingDragged;
    }

    function dragEnd() {
        let validMoves = [squareIdBeingDragged - 1, squareIdBeingDragged - width, squareIdBeingDragged + 1, squareIdBeingDragged + width];
        let validMove = validMoves.includes(squareIdBeingReplaced);

        if (squareIdBeingReplaced && validMove) {
            squareIdBeingReplaced = null;
        } else if (squareIdBeingReplaced && !validMove) {
            squares[squareIdBeingReplaced].style.backgroundImage = colorBeingReplaced;
            squares[squareIdBeingDragged].style.backgroundImage = colorBeingDragged;
        }
    }

    function touchStart(e) { e.preventDefault(); squareIdBeingDragged = parseInt(this.id); colorBeingDragged = this.style.backgroundImage; }
    function touchMove(e) { e.preventDefault(); const touch = e.touches[0]; const element = document.elementFromPoint(touch.clientX, touch.clientY); if (element && squares.includes(element)) { squareIdBeingReplaced = parseInt(element.id); } else { squareIdBeingReplaced = null; } }
    function touchEnd() { if (squareIdBeingReplaced !== null) { dragDrop.call(squares[squareIdBeingReplaced]); dragEnd(); } }

    function moveDown() {
        for (let i = 0; i < 55; i++) {
            if (squares[i + width].style.backgroundImage === '') {
                squares[i + width].style.backgroundImage = squares[i].style.backgroundImage;
                squares[i].style.backgroundImage = '';
            }
        }
        for (let i = 0; i < width; i++) {
            if (squares[i].style.backgroundImage === '') {
                let randomColor = Math.floor(Math.random() * candyColors.length);
                squares[i].style.backgroundImage = candyColors[randomColor];
            }
        }
    }

    function checkRowFor(num) {
        for (let i = 0; i < 64; i++) {
            let rowOfNum = [];
            for (let j = 0; j < num; j++) {
                if (i % width + j < width) rowOfNum.push(i + j);
            }
            if (rowOfNum.length !== num) continue;
            let decidedColor = squares[rowOfNum[0]].style.backgroundImage;
            if (decidedColor === '') continue;
            if (rowOfNum.every(index => squares[index].style.backgroundImage === decidedColor)) {
                score += num;
                updateScoreboard();
                rowOfNum.forEach(index => { squares[index].style.backgroundImage = ''; });
            }
        }
    }

    function checkColumnFor(num) {
        for (let i = 0; i < 64 - width * (num - 1); i++) {
            let columnOfNum = [];
            for (let j = 0; j < num; j++) {
                columnOfNum.push(i + j * width);
            }
            let decidedColor = squares[columnOfNum[0]].style.backgroundImage;
            if (decidedColor === '') continue;
            if (columnOfNum.every(index => squares[index].style.backgroundImage === decidedColor)) {
                score += num;
                updateScoreboard();
                columnOfNum.forEach(index => { squares[index].style.backgroundImage = ''; });
            }
        }
    }

    function updateScoreboard() { scoreDisplay.innerHTML = `Pontos: ${score} / ${scoreToWin}`; levelDisplay.innerHTML = `Nível: ${currentLevel}`; }

    function levelUp() { /* ... */ }
    
    window.setInterval(function(){
        checkRowFor(4);
        checkColumnFor(4);
        checkRowFor(3);
        checkColumnFor(3);
        moveDown();
        if (score >= scoreToWin && !isGameWon) {
            isGameWon = true;
            window.parent.postMessage('gameWon', '*');
            // ... (mensagem de vitória)
        }
    }, 100);

    function startGame() {
        createBoard();
        score = 0; currentLevel = 1; scoreToWin = 100; isGameWon = false;
        updateScoreboard();
        squares.forEach(square => {
            square.addEventListener('dragstart', dragStart);
            square.addEventListener('dragover', (e) => e.preventDefault());
            square.addEventListener('dragenter', (e) => e.preventDefault());
            square.addEventListener('dragleave', () => {});
            square.addEventListener('drop', dragDrop);
            square.addEventListener('dragend', dragEnd);
            square.addEventListener('touchstart', touchStart, { passive: false });
            square.addEventListener('touchmove', touchMove, { passive: false });
            square.addEventListener('touchend', touchEnd, { passive: false });
        });
    }

    startGame();
}

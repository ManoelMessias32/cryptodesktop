document.addEventListener("DOMContentLoaded", () => {
    // Lógica completa do jogo Candy Crush otimizada para celular e Telegram
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
            "url(./utils/red-candy.png)",
            "url(./utils/blue-candy.png)",
            "url(./utils/green-candy.png)",
            "url(./utils/yellow-candy.png)",
            "url(./utils/orange-candy.png)",
            "url(./utils/purple-candy.png)",
        ];

        function createBoard() {
            for (let i = 0; i < width * width; i++) {
                const square = document.createElement("div");
                square.setAttribute("id", i);
                let randomColor = Math.floor(Math.random() * candyColors.length);
                square.style.backgroundImage = candyColors[randomColor];
                grid.appendChild(square);
                squares.push(square);
            }
        }

        let firstSquare = null;

        function squareClick() {
            if (this.classList.contains("selected")) {
                this.classList.remove("selected");
                firstSquare = null;
                return;
            }

            if (firstSquare === null) {
                firstSquare = this;
                this.classList.add("selected");
            } else {
                const secondSquare = this;
                const firstId = parseInt(firstSquare.id);
                const secondId = parseInt(secondSquare.id);

                const validMoves = [firstId - 1, firstId - width, firstId + 1, firstId + width];
                const isValidMove = validMoves.includes(secondId);

                if (isValidMove) {
                    const firstColor = firstSquare.style.backgroundImage;
                    const secondColor = secondSquare.style.backgroundImage;
                    
                    // Otimistic swap
                    firstSquare.style.backgroundImage = secondColor;
                    secondSquare.style.backgroundImage = firstColor;

                    // Check for matches
                    const isMatch = checkMatch();

                    if (!isMatch) {
                        // Revert if no match
                        setTimeout(() => {
                            firstSquare.style.backgroundImage = firstColor;
                            secondSquare.style.backgroundImage = secondColor;
                        }, 200);
                    } else {
                        // If there is a match, keep the swap and let the game loop handle the rest
                        gameLoop();
                    }
                }

                firstSquare.classList.remove("selected");
                firstSquare = null;
            }
        }
        
        function gameLoop() {
            let wasMatch = checkMatch();
            if (wasMatch) {
                // Keep checking and moving down until no more matches are found
                const loop = setInterval(()=>{
                    moveDown();
                    if(!checkMatch()){
                       clearInterval(loop)
                    }
                }, 200)
            }
            checkWinCondition();
        }
        
        function checkMatch() {
            let hasMatch = false;
            if (checkRowFor(4)) hasMatch = true;
            if (checkColumnFor(4)) hasMatch = true;
            if (checkRowFor(3)) hasMatch = true;
            if (checkColumnFor(3)) hasMatch = true;
            return hasMatch;
        }

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
                let rowOfNum = Array.from({length: num}, (_, k) => i + k);
                if (i % width + (num - 1) >= width) continue; 

                let decidedColor = squares[rowOfNum[0]].style.backgroundImage;
                if (decidedColor === '') continue;

                if (rowOfNum.every(index => squares[index].style.backgroundImage === decidedColor)) {
                    score += num;
                    updateScoreboard();
                    rowOfNum.forEach(index => { squares[index].style.backgroundImage = ''; });
                    return true;
                }
            }
            return false;
        }

        function checkColumnFor(num) {
            for (let i = 0; i < 64 - width * (num - 1); i++) {
                let columnOfNum = Array.from({length: num}, (_, k) => i + k * width);

                let decidedColor = squares[columnOfNum[0]].style.backgroundImage;
                if (decidedColor === '') continue;

                if (columnOfNum.every(index => squares[index].style.backgroundImage === decidedColor)) {
                    score += num;
                    updateScoreboard();
                    columnOfNum.forEach(index => { squares[index].style.backgroundImage = ''; });
                    return true;
                }
            }
            return false;
        }

        function updateScoreboard() { scoreDisplay.innerHTML = `Pontos: ${score} / ${scoreToWin}`; levelDisplay.innerHTML = `Nível: ${currentLevel}`; }
        
        function checkWinCondition() {
            if (score >= scoreToWin && !isGameWon) {
                window.parent.postMessage('gameWon', '*');
                isGameWon = true;
                currentLevel++;
                scoreToWin += 150;
                updateScoreboard();
            }
        }

        function startGame() {
            createBoard();
            score = 0; currentLevel = 1; scoreToWin = 100; isGameWon = false;
            updateScoreboard();
            squares.forEach(square => {
                square.addEventListener('click', squareClick);
            });
        }

        startGame();
    }
    candyCrushGame();
});

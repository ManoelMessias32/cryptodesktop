document.addEventListener("DOMContentLoaded", () => {
    // Lógica completa do jogo Candy Crush restaurada com sistema de clique
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
                square.setAttribute("id", i);
                let randomColor = Math.floor(Math.random() * candyColors.length);
                square.style.backgroundImage = candyColors[randomColor];
                grid.appendChild(square);
                squares.push(square);
            }
        }

        let firstSquare = null;

        function squareClick() {
            if (firstSquare === null) {
                // Primeiro clique: seleciona o doce
                firstSquare = this;
                this.classList.add("selected");
            } else {
                // Segundo clique: tenta a troca
                const secondSquare = this;
                const firstId = parseInt(firstSquare.id);
                const secondId = parseInt(secondSquare.id);

                const validMoves = [firstId - 1, firstId - width, firstId + 1, firstId + width];
                const isValidMove = validMoves.includes(secondId);

                if (isValidMove) {
                    // Troca as cores
                    const firstColor = firstSquare.style.backgroundImage;
                    const secondColor = secondSquare.style.backgroundImage;
                    firstSquare.style.backgroundImage = secondColor;
                    secondSquare.style.backgroundImage = firstColor;

                    // Verifica se a troca resultou em uma combinação válida
                    const isAValidMatch = () => {
                        return checkRowFor(3) || checkColumnFor(3) || checkRowFor(4) || checkColumnFor(4);
                    };

                    // Desfaz a troca se não for válida
                    setTimeout(() => {
                        if (!isAValidMatch()) {
                            firstSquare.style.backgroundImage = firstColor;
                            secondSquare.style.backgroundImage = secondColor;
                        }
                    }, 200);

                } 
                
                // Limpa a seleção
                firstSquare.classList.remove("selected");
                firstSquare = null;
            }
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

        window.setInterval(function(){
            checkRowFor(4);
            checkColumnFor(4);
            checkRowFor(3);
            checkColumnFor(3);
            moveDown();
            checkWinCondition();
        }, 200);

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

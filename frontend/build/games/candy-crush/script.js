<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <!-- ADIÇÃO: Viewport essencial pro Telegram WebView -- força responsivo e sem zoom -->
    <title>Candy Crush - CryptoDesk</title>
    <style>
        /* ADIÇÃO: CSS responsivo completo pro bot */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            font-family: Arial, sans-serif;
            overflow: auto; /* ADIÇÃO: Permite scroll se necessário */
            padding: 10px;
        }

        .grid {
            display: grid;
            grid-template-columns: repeat(8, 1fr);
            gap: 1px;
            background-color: #f0f0f0;
            padding: 5px;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            max-width: 100vw; /* ADIÇÃO: Não ultrapassa a largura da tela */
            max-height: 80vh; /* ADIÇÃO: Limita altura pra caber no WebView do Telegram */
            overflow: auto; /* ADIÇÃO: Scroll interno se o grid for grande */
        }

        .grid div {
            width: 100%;
            height: 50px; /* ADIÇÃO: Altura menor e responsiva pro mobile */
            background-size: contain !important;
            background-repeat: no-repeat !important;
            background-position: center !important;
            cursor: pointer;
            border: 1px solid rgba(0,0,0,0.1);
            transition: all 0.2s ease;
            image-rendering: pixelated;
        }

        .selected {
            border: 3px solid #ffeb3b !important;
            transform: scale(1.1);
        }

        /* ADIÇÃO: Media query pro Telegram mobile (telas < 500px) */
        @media (max-width: 500px) {
            .grid div {
                height: 40px; /* Ainda menor em celulares */
            }
            .grid {
                max-height: 70vh;
            }
        }

        /* ADIÇÃO: Esconde scrollbars pra ficar clean */
        .grid::-webkit-scrollbar {
            display: none;
        }
    </style>
</head>
<body>
    <div class="grid"></div> <!-- Seu grid original -->

    <script>
        // Seu JS original com as correções de URL (pro Vercel)
        document.addEventListener("DOMContentLoaded", () => {
            const grid = document.querySelector(".grid");
            const width = 8;
            const squares = [];

            // URLs absolutas pro seu Vercel (como corrigimos antes)
            const baseUrl = 'https://cryptodesktop.vercel.app/';
            const candyColors = [
                `url(${baseUrl}utils/red-candy.png)`,
                `url(${baseUrl}utils/blue-candy.png)`,
                `url(${baseUrl}utils/green-candy.png)`,
                `url(${baseUrl}utils/yellow-candy.png)`,
                `url(${baseUrl}utils/orange-candy.png)`,
                `url(${baseUrl}utils/purple-candy.png)`,
            ];

            function createBoard() {
                for (let i = 0; i < width * width; i++) {
                    const square = document.createElement("div");
                    square.setAttribute("id", i);
                    let randomColor = Math.floor(Math.random() * candyColors.length);
                    square.style.backgroundImage = candyColors[randomColor];
                    square.setAttribute("draggable", false); // Evita drag no mobile
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

                        firstSquare.style.backgroundImage = secondColor;
                        secondSquare.style.backgroundImage = firstColor;

                        setTimeout(() => {
                            if (!checkMatch()) {
                                firstSquare.style.backgroundImage = firstColor;
                                secondSquare.style.backgroundImage = secondColor;
                            } else {
                                window.parent.postMessage('gameWon', '*');
                                gameLoop();
                            }
                        }, 200);
                    }

                    firstSquare.classList.remove("selected");
                    firstSquare = null;
                }
            }

            function gameLoop() {
                moveDown();
                let hasMatch = checkMatch();
                if (hasMatch) {
                    setTimeout(gameLoop, 200);
                }
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
                        columnOfNum.forEach(index => { squares[index].style.backgroundImage = ''; });
                        return true;
                    }
                }
                return false;
            }

            function startGame() {
                createBoard();
                squares.forEach(square => {
                    square.addEventListener('click', squareClick);
                });
            }

            // ADIÇÃO: Previne zoom/scroll indesejado no Telegram
            document.addEventListener('touchstart', function(e) {
                e.preventDefault();
            }, { passive: false });

            startGame();
        });
    </script>
</body>
</html>
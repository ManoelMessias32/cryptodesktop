document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('.grid');
    const scoreDisplay = document.getElementById('score');
    const width = 8;
    const squares = [];
    let score = 0;

    const candyColors = [
        'url(https://cryptodesktop.vercel.app/games/candy-crush/utils/red-candy.png)',
        'url(https://cryptodesktop.vercel.app/games/candy-crush/utils/blue-candy.png)',
        'url(https://cryptodesktop.vercel.app/games/candy-crush/utils/green-candy.png)',
        'url(https://cryptodesktop.vercel.app/games/candy-crush/utils/yellow-candy.png)',
        'url(https://cryptodesktop.vercel.app/games/candy-crush/utils/orange-candy.png)',
        'url(https://cryptodesktop.vercel.app/games/candy-crush/utils/purple-candy.png)'
    ];

    function createBoard() {
        for (let i = 0; i < width * width; i++) {
            const square = document.createElement('div');
            square.setAttribute('id', i);
            let randomColor = Math.floor(Math.random() * candyColors.length);
            square.style.backgroundImage = candyColors[randomColor];
            grid.appendChild(square);
            squares.push(square);
        }
    }

    createBoard();
    runGameLoop();

    let firstSquare = null;

    function squareClick() {
        if (firstSquare === null) {
            firstSquare = this;
            this.classList.add('selected');
        } else {
            const secondSquare = this;
            firstSquare.classList.remove('selected');

            if (firstSquare === secondSquare) {
                firstSquare = null;
                return;
            }

            const firstId = parseInt(firstSquare.id);
            const secondId = parseInt(secondSquare.id);
            const validMoves = [firstId - 1, firstId + 1, firstId - width, firstId + width];
            if (validMoves.includes(secondId)) {
                swapSquares(firstSquare, secondSquare);
                setTimeout(() => {
                    if (!runGameLoop()) {
                        swapSquares(firstSquare, secondSquare); // Swap back if no match
                    }
                }, 200);
            }
            firstSquare = null;
        }
    }

    function swapSquares(sq1, sq2) {
        const tempColor = sq1.style.backgroundImage;
        sq1.style.backgroundImage = sq2.style.backgroundImage;
        sq2.style.backgroundImage = tempColor;
    }

            createBoard();

            // FIX FINAL — FUNCIONA EM TODOS OS CELULARES
            squares.forEach(square => {
                square.addEventListener('click', squareClick);
                square.addEventListener('pointerdown', function(e) {
                    e.preventDefault();
                    squareClick.call(this);
                });
                square.addEventListener('touchstart', e => e.stopPropagation());
            });

            runGameLoop();

    function runGameLoop() {
        const matches = checkAllMatches();
        if (matches.length > 0) {
            removeMatches(matches);
            // This timeout is crucial for the visual effect of falling candies
            setTimeout(() => {
                moveDown(); 
                // Chain reaction: check for new matches after candies have fallen
                setTimeout(runGameLoop, 300);
            }, 200);
            return true; // Matches were found and processed
        }
        return false; // No matches found
    }

    function checkAllMatches() {
        let allMatches = new Set();
        for (let i = 0; i < width * width; i++) {
            const color = squares[i].style.backgroundImage;
            if (color === '') continue;

            // Check for horizontal matches of 3 or more
            if (i % width < width - 2) {
                if (squares[i + 1].style.backgroundImage === color && squares[i + 2].style.backgroundImage === color) {
                    allMatches.add(i); allMatches.add(i + 1); allMatches.add(i + 2);
                }
            }
            // Check for vertical matches of 3 or more
            if (i < width * (width - 2)) {
                if (squares[i + width].style.backgroundImage === color && squares[i + 2 * width].style.backgroundImage === color) {
                    allMatches.add(i); allMatches.add(i + width); allMatches.add(i + 2 * width);
                }
            }
        }
        return Array.from(allMatches);
    }

    function removeMatches(matches) {
        score += matches.length;
        scoreDisplay.innerHTML = score;
        matches.forEach(index => {
            squares[index].style.backgroundImage = '';
        });
    }

    function moveDown() {
        // Iterate over each column
        for (let c = 0; c < width; c++) {
            let emptySquareIndex = -1;
            // From bottom to top
            for (let r = width - 1; r >= 0; r--) {
                const i = r * width + c;
                if (squares[i].style.backgroundImage === '') {
                    if (emptySquareIndex === -1) {
                        emptySquareIndex = i; // First empty square found
                    }
                } else if (emptySquareIndex !== -1) {
                    // If there's an empty square below, move the current candy down
                    squares[emptySquareIndex].style.backgroundImage = squares[i].style.backgroundImage;
                    squares[i].style.backgroundImage = '';
                    emptySquareIndex -= width; // Move the empty spot marker up
                }
            }
        }
        refillBoard();
    }

    function refillBoard() {
        for (let i = 0; i < width * width; i++) {
            if (squares[i].style.backgroundImage === '') {
                let randomColor = Math.floor(Math.random() * candyColors.length);
                squares[i].style.backgroundImage = candyColors[randomColor];
            }
        }
    }
});

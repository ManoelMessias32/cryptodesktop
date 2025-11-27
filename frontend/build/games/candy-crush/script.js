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

    let firstSquare = null;

    function squareClick() {
        if (firstSquare === null) {
            // First click
            firstSquare = this;
            this.classList.add('selected');
        } else {
            // Second click
            const secondSquare = this;
            secondSquare.classList.add('selected');

            const firstId = parseInt(firstSquare.id);
            const secondId = parseInt(secondSquare.id);

            // Check for valid move (adjacent squares)
            const validMoves = [firstId - 1, firstId - width, firstId + 1, firstId + width];
            const isValidMove = validMoves.includes(secondId);

            if (isValidMove) {
                // Swap colors
                const firstColor = firstSquare.style.backgroundImage;
                const secondColor = secondSquare.style.backgroundImage;
                firstSquare.style.backgroundImage = secondColor;
                secondSquare.style.backgroundImage = firstColor;

                setTimeout(() => {
                    if (!checkForMatches()) {
                        // If no match, swap back
                        firstSquare.style.backgroundImage = firstColor;
                        secondSquare.style.backgroundImage = secondColor;
                    }
                    gameLoop();
                }, 200);

            } else {
                // Invalid move, just deselect
                setTimeout(() => {
                    firstSquare.classList.remove('selected');
                    secondSquare.classList.remove('selected');
                }, 200);
            }
            
            firstSquare = null; // Reset for next turn
        }
    }

    squares.forEach(square => square.addEventListener('click', squareClick));

    function checkForMatches() {
        let hasMatched = false;
        if (checkRowFor(3)) hasMatched = true;
        if (checkColumnFor(3)) hasMatched = true;
        return hasMatched;
    }

    function gameLoop() {
        moveDown();
        let hasMatch = checkForMatches();
        if (hasMatch) {
            setTimeout(gameLoop, 200); // Keep checking until no more matches
        }
    }

    function moveDown() {
        for (let i = 0; i < 56; i++) { // Adjusted loop to prevent overflow
            if (squares[i + width].style.backgroundImage === '') {
                squares[i + width].style.backgroundImage = squares[i].style.backgroundImage;
                squares[i].style.backgroundImage = '';
            }
        }
        // Fill empty top-row squares
        for (let i = 0; i < width; i++) {
            if (squares[i].style.backgroundImage === '') {
                let randomColor = Math.floor(Math.random() * candyColors.length);
                squares[i].style.backgroundImage = candyColors[randomColor];
            }
        }
    }

    function checkRowFor(num) {
        let matchFound = false;
        for (let i = 0; i < 64; i++) {
            const row = Array.from({length: num}, (_, k) => i + k);
            if (i % width > width - num) continue; // Avoid wrapping

            const decidedColor = squares[i].style.backgroundImage;
            if (decidedColor === '') continue;

            if (row.every(index => squares[index].style.backgroundImage === decidedColor)) {
                score += num;
                scoreDisplay.innerHTML = score;
                row.forEach(index => { squares[index].style.backgroundImage = ''; });
                matchFound = true;
            }
        }
        return matchFound;
    }

    function checkColumnFor(num) {
        let matchFound = false;
        for (let i = 0; i < 64 - width * (num - 1); i++) {
            const column = Array.from({length: num}, (_, k) => i + k * width);
            
            const decidedColor = squares[i].style.backgroundImage;
            if (decidedColor === '') continue;

            if (column.every(index => squares[index].style.backgroundImage === decidedColor)) {
                score += num;
                scoreDisplay.innerHTML = score;
                column.forEach(index => { squares[index].style.backgroundImage = ''; });
                matchFound = true;
            }
        }
        return matchFound;
    }
});

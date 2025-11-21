// Tetris Piece Shapes
const lShape = [
    // 1st rotation, 2nd rotation, 3rd rotation, 4th rotation
    [1, 2, gridWidth+1, gridWidth*2+1], 
    [gridWidth, gridWidth+1, gridWidth+2, gridWidth*2+2],
    [1, gridWidth+1, gridWidth*2, gridWidth*2+1],
    [gridWidth, gridWidth*2, gridWidth*2+1, gridWidth*2+2]
];
const zShape = [
    [gridWidth + 1, gridWidth + 2, gridWidth*2, gridWidth*2 + 1],
    [0, gridWidth, gridWidth + 1, gridWidth*2 + 1],
    [gridWidth + 1, gridWidth + 2, gridWidth*2, gridWidth*2 + 1],
    [0, gridWidth, gridWidth + 1, gridWidth*2 + 1]
];
const tShape = [
    [1, gridWidth, gridWidth + 1, gridWidth + 2],
    [1, gridWidth + 1, gridWidth + 2, gridWidth*2 + 1],
    [gridWidth, gridWidth + 1, gridWidth + 2, gridWidth*2 + 1],
    [1, gridWidth, gridWidth + 1, gridWidth*2 + 1]
];
const oShape = [
    [0, 1, gridWidth, gridWidth + 1],
    [0, 1, gridWidth, gridWidth + 1],
    [0, 1, gridWidth, gridWidth + 1],
    [0, 1, gridWidth, gridWidth + 1]
];
const iShape = [
    [1, gridWidth + 1, gridWidth*2 + 1, gridWidth*3 + 1],
    [gridWidth, gridWidth + 1, gridWidth + 2, gridWidth + 3],
    [1, gridWidth + 1, gridWidth*2 + 1, gridWidth*3 + 1],
    [gridWidth, gridWidth + 1, gridWidth + 2, gridWidth + 3]
];

const allShapes = [lShape, zShape, tShape, oShape, iShape];

// Piece colors
const colors = ["red", "green", "orange", "yellow", "pink"];
let currentColor = Math.floor(Math.random() * colors.length);
let nextColor = colors[currentColor];
let currentPosition = 3;
let currentRotation = 0;
let randomShape = Math.floor(Math.random() * allShapes.length);
let currentShape = allShapes[randomShape][currentRotation];
let $gridSquares = Array.from(document.querySelectorAll(".grid div"));

// Defining the next shapes
const $miniGridSquares = document.querySelectorAll(".mini-grid div");
const miniGridWidth = 6;
const nextPosition = 2;
const possibleNextShapes = [
    [ 1, 2, miniGridWidth+1, miniGridWidth*2+1 ],
    [ miniGridWidth+1, miniGridWidth+2, miniGridWidth*2, miniGridWidth*2+1 ],
    [ 1, miniGridWidth, miniGridWidth+1, miniGridWidth+2],
    [ 0, 1, miniGridWidth, miniGridWidth+1],
    [ 1, miniGridWidth+1, miniGridWidth*2+1, miniGridWidth*3+1 ]
];

let nextRandomShape = Math.floor(Math.random() * possibleNextShapes.length);

// Function to display the next shape
function displayNextShape(){
    
    // erase old shapes
    $miniGridSquares.forEach(square =>
        square.classList.remove("shapePainted", `${colors[nextColor]}`)
    );

    nextColor = Math.floor(Math.random() * colors.length);
    nextRandomShape =  Math.floor(Math.random() * possibleNextShapes.length);
    const nextShape = possibleNextShapes[nextRandomShape];

    nextShape.forEach(squareIndex =>
        $miniGridSquares[squareIndex + nextPosition + miniGridWidth].classList.add("shapePainted", `${colors[nextColor]}`)
    );   
}

displayNextShape();

// Function to draw the current shape on the grid
function drawShape(){
    currentShape.forEach(squareIndex => {
        $gridSquares[squareIndex + currentPosition].classList.add("shapePainted", `${colors[currentColor]}`);
    });
}

// Function to delete the current grid shape
function eraseShape(){
    currentShape.forEach(squareIndex => {
        $gridSquares[squareIndex + currentPosition].classList.remove("shapePainted", `${colors[currentColor]}`);
    });
}

// Function to freeze the current shape when it reaches the bottom or another shape
function freezeFilled() {
    if (currentShape.some(squareIndex =>
        squareIndex + currentPosition + gridWidth >= $gridSquares.length ||
        $gridSquares[squareIndex + currentPosition + gridWidth].classList.contains("filled")
    )) {
        currentShape.forEach(squareIndex => {
            // Check if the element exists
            if ($gridSquares[squareIndex + currentPosition]) {
                $gridSquares[squareIndex + currentPosition].classList.add("filled");
            }
        });

        // Check if the game has finished before removing the last block
        if(hasWon) {
            // Remove the "shapePainted" class so that the last block disappears
            currentShape.forEach(squareIndex => {
                if ($gridSquares[squareIndex + currentPosition]) {
                    $gridSquares[squareIndex + currentPosition].classList.remove("shapePainted");
                }
            });
        }

        currentShape.forEach(squareIndex => {
            // Check if the element exists
            if ($gridSquares[squareIndex + currentPosition]) {
                $gridSquares[squareIndex + currentPosition].classList.add("filled");
            }
        });

        currentPosition = 3;
        currentRotation = 0;

        randomShape = nextRandomShape;
        currentShape = allShapes[randomShape][currentRotation];
        currentColor = nextColor;

        drawShape();
        checkIfRowsFilled();

        // Score increases every time a shape is frozen (5 points currently)
        updateScore(5);
        displayNextShape();
        freezeAudio.play();

        // Check if the game is over
        gameOver();
    }
}

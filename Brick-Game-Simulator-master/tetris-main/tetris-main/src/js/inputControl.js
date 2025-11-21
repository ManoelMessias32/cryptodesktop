// Function to handle keyboard events
document.addEventListener("keydown", controlKeyBoard);
document.addEventListener("keyup", onKeyUp);

let pressRight = false
let pressLeft = false
let pressDown = false
let pressUp = false

function onKeyUp(event) {
    mustBeRotate = true

    if (event.key == 'ArrowRight') {
        pressRight = false;
    }
    else if (event.key == 'ArrowLeft') {
        pressLeft = false;
    }
    else if (event.key == 'ArrowDown') {
        pressDown = false;
    }
    else if (event.key == 'ArrowUp') {
        pressUp = false;
    }
}

const keyBoardMap = {
    "ArrowLeft": moveLeft,
    "ArrowRight": moveRight,
    "ArrowDown": moveDown,
    "ArrowUp": rotateShape
};

// Movement speed
setInterval(() => {
    if(!timerId){
        return;
    }
    if (pressRight) {
        moveRight();
    }
    if (pressLeft) {
        moveLeft();
    }
    if (pressDown) {
        moveDown();
    }
}, 75)

let rotateCoolDown = 0;
let mustBeRotate = true

setInterval(() => {
    if(!timerId){
        return
    }
    if (pressUp && mustBeRotate) {
        rotateShape();
        mustBeRotate = false
    }
}, 23)

function controlKeyBoard(event){
    if(event.keyCode == 32){
        event.preventDefault()
        pauseGame()
    }
    
    if (timerId){
        if (event.key == 'ArrowRight') {
            pressRight = true;
        }
        else if (event.key == 'ArrowLeft') {
            pressLeft = true;
        }
        else if (event.key == 'ArrowDown') {
            pressDown = true;
        }
        else if (event.key == 'ArrowUp') {
            pressUp = true;
        }
    }
}

// Functions for moving pieces
function moveDown(){
    // Check if the game has already been beaten to stop
    if (hasWon) return;

    freezeFilled();
    eraseShape();
    currentPosition += gridWidth;
    drawShape();
    playMoveSound();
}

function moveLeft(){
    if (hasWon) return;

    // Check for edge limit
    const isEdgeLimit  = currentShape.some((squareIndex) => (squareIndex + currentPosition) % gridWidth === 0);
    if (isEdgeLimit) return;

    const isFilled = currentShape.some(squareIndex => 
        $gridSquares[squareIndex + currentPosition - 1].classList.contains("filled")
    )

    if (isFilled) return;

    eraseShape();
    currentPosition--;
    drawShape();
    playMoveSound();
}

function moveRight(){
    if (hasWon) return;

    const isEdgeLimit  = currentShape.some((squareIndex) => (squareIndex + currentPosition) % gridWidth === gridWidth - 1);
    if (isEdgeLimit) return;

    const isFilled = currentShape.some(squareIndex => 
        $gridSquares[squareIndex + currentPosition + 1].classList.contains("filled")
    )

    if (isFilled) return;
    eraseShape();
    currentPosition++;
    drawShape();
    playMoveSound();
}

function previousRotation(){
    if (currentRotation === 0){
        currentRotation = currentShape.length - 1;
    } else {
        currentRotation--;
    }
    currentShape = allShapes[randomShape][currentRotation];
}

function rotateShape(){
    if (hasWon) return;
    eraseShape();

    if (currentRotation === currentShape.length - 1) {
        currentRotation = 0;
    } else {
        currentRotation++;
    }

    currentShape = allShapes[randomShape][currentRotation];
    
    const isLeftEdgeLimit = currentShape.some(( squareIndex ) =>
        (squareIndex + currentPosition) % gridWidth === 0
    );

    const isRightEdgeLimit = currentShape.some(( squareIndex ) =>
        (squareIndex + currentPosition) % gridWidth === gridWidth-1
    );

    if (isLeftEdgeLimit && isRightEdgeLimit){
        previousRotation();
    }

    const isFilled  = currentShape.some(squareIndex =>
        $gridSquares[squareIndex + currentPosition].classList.contains("filled")
    );

    if (isFilled) previousRotation();

    drawShape();
    playRotateSound();
}

// Mobile Control
const isMobile = window.matchMedia('(max-width: 990px)').matches;

if (isMobile) {
    const buttonMap = {
        'left-button': moveLeft,
        'right-button': moveRight,
        'down-button': moveDown,
        'rotate-button': rotateShape,
    }

    const $mobileButtons = document
        .querySelectorAll(".mobile-buttons-container button");

    $mobileButtons.forEach(button => {
        button.classList.add('disabled-dbl-tap-zoom');

        button.addEventListener("click", () => {
            if (timerId){
                buttonMap[button.classList[0]]()
            }
    
        });
    });
}

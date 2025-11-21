/*
    Author: Pedro Miranda (pLogicador)
    Date created: 12/09/2023
    NOTE: In testing phase!!
*/


// Game initialization
let timeMoveDown = 500;
let timerId = null;
const $startStopButton = document.getElementById("start-button");
const $restartButton = document.getElementById("restart-button");

// Play/Pause button click event
$startStopButton.addEventListener("click", () => pauseGame());
$restartButton.addEventListener("click", () => window.location.reload());

// Function to pause the game
function pauseGame() {
    if (timerId) {
        clearInterval(timerId);
        timerId = null;
        $startStopButton.textContent = "PLAY";
        currentMusic.pause();
        musicStarted = false;

        // Pauses background music if it is playing
        if (musicStarted) {
            currentMusic.pause();
            musicStarted = false;
        }
        playPauseSound();

    } else {
        timerId = setInterval(moveDown, timeMoveDown);
        $startStopButton.textContent = "PAUSE";
        
        // Starts background music if it hasn't already started
        if (!musicStarted) {
            playBackgroundMusic();
        }
    }
}

// Credits text
function displayCredits() {  
    document.getElementById('content-credit').classList.remove('hide');    
    document.getElementById('credit-div').classList.add("credit");
}

// Check the victory
function checkWinCondition() {
    if (score >= levels[levels.length-1].maxScore) {
        gameWin();
    }
}

// Function to handle player victory
function gameWin() {
    if (!hasWon) {
        clearInterval(timerId);
        timerId = null;
        $startStopButton.disabled = true;

        // Clear the grid immediately
        $gridSquares.forEach(square => {
            square.classList.remove("filled", "shapePainted");
        });

        // Set 'hasWon' to true to prevent the victory music from playing repeatedly
        hasWon = true;
        playVictoryMusic();
        $score.innerHTML += "<br />" + "<br />" + "VICTORY!";
        hasWon = true;
    }

    // Calls the display credits function
    displayCredits();
}

// Create a function to play the victory music
function playVictoryMusic() {
    currentMusic.pause();
    const victoryAudio = new Audio("./src/assets/sounds/credits.mp3");
    victoryAudio.play();
}

// Function to handle the end of the game
function gameOver(){
    if (currentShape.some(squareIndex =>
        $gridSquares[squareIndex + currentPosition].classList.contains("filled")
    )) {
        updateScore(13); //13 -0
        clearInterval(timerId);
        timerId = null;
        $startStopButton.disabled = true;

        // Pauses background music if it is playing
        if (musicStarted) {
            currentMusic.pause();
            musicStarted = false;
        }

        gameOverAudio.play();
        $score.innerHTML += "<br />" + "GAMER OVER";
    };
}

let consecutiveLinesCleared = 0; // Global variable to track the number of consecutive lines the player has cleared
let $grid = document.querySelector(".grid");

// Function to check if a row has been filled completely
function checkIfRowsFilled(){
    // checking 10 by 10 lines
    for (row = 0; row < $gridSquares.length; row += gridWidth) {
        let currentRow = [];
        for (var square = row; square < row + gridWidth; square++) {
            currentRow.push(square);
        }

        const isRowPainted = currentRow.every( square => 
            $gridSquares[square].classList.contains("shapePainted")
        );

        if (isRowPainted) {
            const squareRemoved = $gridSquares.splice(row, gridWidth);
            squareRemoved.forEach(square => {
                square.classList.remove("shapePainted", "filled");
                square.removeAttribute("class");
            });
        
            $gridSquares = squareRemoved.concat($gridSquares);
            $gridSquares.forEach(square => $grid.appendChild(square));
        
            updateScore(50);

            // Checks if the player has cleared 3 consecutive lines
            consecutiveLinesCleared++;
            if (consecutiveLinesCleared === 4) {
                // Grants 30 extra points for clearing 3 consecutive lines
                updateScore(50); 
                // Reset the consecutive lines counter
                consecutiveLinesCleared = 0;
            }

            playCompleteLineAudio();
        }
    }
}

// variable to track the number of completed lines
let linesCleared = 0;

// Function to update the line counter
function updateLinesCounter() {
    const $linesCount = document.getElementById('lines-count');
    $linesCount.textContent = linesCleared;
}

// Function to update score and difficulty
const $score = document.querySelector(".score");
let score = 0;

function updateScore(updateValue){
    score += updateValue;
    $score.textContent = score;
    checkWinCondition();
    
    // Difficulties according to score
    clearInterval(timerId)
    changeMusicAndDifficulty();
    timerId = setInterval(moveDown, timeMoveDown);
}

// Reduces the Number of DOM Queries
const $linesCount = document.getElementById('lines-count');
const $level = document.getElementById('level');

// Current level
let currentLevel = 1; 

const levels = [
    {
        minScore: 350,
        maxScore: 1150,
        music: musicB,
        timeMoveDown: 390
    },
    {
        minScore: 1150,
        maxScore: 2000,
        music: musicC,
        timeMoveDown: 350
    },
    {
        minScore: 2000,
        maxScore: 3200,
        music: musicD,
        timeMoveDown: 290
    },
    {
        minScore: 3200,
        maxScore: 4300,
        music: musicE,
        timeMoveDown: 230
    },
    {
        minScore: 4300,
        maxScore: 5800,
        music: musicF,
        timeMoveDown: 200
    },
    {
        minScore: 5800,
        maxScore: 7000,
        music: musicG,
        timeMoveDown: 190
    },
    {
        minScore: 7000,
        maxScore: 8000,
        music: musicH,
        timeMoveDown: 180
    },
    {
        minScore: 8000,
        maxScore: 90000,
        music: musicI,
        timeMoveDown: 170
    },
    {
        minScore: 90000,
        maxScore: 11000,
        music: musicJ,
        timeMoveDown: 160
    }
];

// Function to change background music and game difficulty
function changeMusicAndDifficulty() {
    // Keep the current level
    let newLevel = currentLevel;
    let nextLevel = levels[newLevel-1]

    if (!nextLevel || !timerId) return

    if (score >= nextLevel.minScore) {
        timeMoveDown = nextLevel.timeMoveDown;
        changeMusic(nextLevel.music);
        applyTheme(newLevel)
        newLevel++;
    }

    // Update the level only if it is greater than the current level
    if (newLevel > currentLevel) {
        currentLevel = newLevel;

        const $level = document.getElementById('level');
        $level.textContent = currentLevel;
    }

    // Set the current song to play infinitely
    currentMusic.loop = true;
}


function applyTheme(themeNumber) {
    if (themeNumber == levels.length - 1) {
        applySnowTheme();
        return;
    }

    // Remove all theme classes from the .grid, .mini-grid and .content-right element
    const grid = document.querySelector('.grid');
    const miniGrid = document.querySelector('.mini-grid');
    const contentRight = document.querySelector('.content-right');
    
    grid.classList.remove(
        'theme-1-grid', 'theme-2-grid', 'theme-3-grid', 
        'theme-4-grid', 'theme-5-grid'
    );
    
    miniGrid.classList.remove(
        'theme-1-mini-grid', 'theme-2-mini-grid', 'theme-3-mini-grid', 
        'theme-4-mini-grid', 'theme-5-mini-grid'
    );

    contentRight.classList.remove(
        'theme-1-content-right', 'theme-2-content-right', 'theme-3-content-right', 
        'theme-4-content-right', 'theme-5-content-right'
    );

    // Applies theme class based on theme number
    grid.classList.add(`theme-${themeNumber}-grid`);
    miniGrid.classList.add(`theme-${themeNumber}-mini-grid`);
    contentRight.classList.add(`theme-${themeNumber}-content-right`);
}

function applyRainTheme() {
    const grid = document.querySelector('.grid');
    grid.classList.add('theme-rain');

    // Adjust the score color for the rain theme
    const scoreElement = document.querySelector('.score');
    scoreElement.style.color = 'red';

    const miniGrid = document.querySelector('.mini-grid');
    miniGrid.classList.add('theme-rain-mini-grid');

    const contentRight = document.querySelector('.content-right');
    contentRight.classList.add('theme-rain-content-right');
}

function applySnowTheme() {
    const grid = document.querySelector('.grid');
    grid.classList.add('theme-snow');

    // Adjust the score color to the snow theme
    const scoreElement = document.querySelector('.score');
    scoreElement.style.color = 'blue';

    const miniGrid = document.querySelector('.mini-grid');
    miniGrid.classList.add('theme-snow-mini-grid');

    const contentRight = document.querySelector('.content-right');
    contentRight.classList.add('theme-snow-content-right');
}

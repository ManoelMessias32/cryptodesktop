// Game settings
let hasWon = false;
const gridWidth = 10; // Total column size
let currentMusicIndex = 0; // Current music index
const musicA = new Audio("./src/assets/sounds/music/TetrisTheme8BitUniverse.mp3");
const musicB = new Audio("./src/assets/sounds/music/Happy8BitUniverse.mp3");
const musicC = new Audio("./src/assets/sounds/music/BillieJean8BitUniverse.mp3");
const musicD = new Audio("./src/assets/sounds/music/Stayin'Alive8BitUniverse.mp3");
const musicE = new Audio("./src/assets/sounds/music/ShakItOff8BitUniverse.mp3");
const musicF = new Audio("./src/assets/sounds/music/TakeOnMe8BitUniverse.mp3");
const musicG = new Audio("./src/assets/sounds/music/Immortals8BitUniverse.mp3");
const musicH = new Audio("./src/assets/sounds/music/Believer8BitUniverse.mp3");
const musicI = new Audio("./src/assets/sounds/music/WelcomeToTheBlackParade8BitUniverse.mp3");
const musicJ = new Audio("./src/assets/sounds/music/HotelCalifornia8BitUniverse.mp3");
const completLineAudio = new Audio("./src/assets/sounds/line-clear.wav");
const gameOverAudio = new Audio("./src/assets/sounds/gameOver.wav");
const freezeAudio = new Audio("./src/assets/sounds/colision.wav");
const moveSound = new Audio("./src/assets/sounds/move-piece.mp3");
const rotateSound = new Audio("./src/assets/sounds/rotate-piece.mp3");

// Functions to adjust sounds
function playRotateSound() {
    rotateSound.playbackRate = 3.50;
    rotateSound.play();
}

function playMoveSound() {
    moveSound.playbackRate = 1.03;
    moveSound.play();
}

// Audio controls
const muteButton = document.getElementById("mute-button");
const audioIcon = document.getElementById("audio-icon");
let isMuted = false;

muteButton.addEventListener("click", () => {
    // Inverts the mutated state
    isMuted = !isMuted; 

    if (isMuted) {
        unmuteAudio();
    } else {
        muteAudio();
    }
});

function muteAudio() {
    audioIcon.classList.remove("audio-on");
    audioIcon.classList.add("audio-off");

    // Sets volume of all songs to 0
    setMusicVolume(0);
}

function unmuteAudio() {
    audioIcon.classList.remove("audio-off");
    audioIcon.classList.add("audio-on");

    // Restores the original volume of songs
    setMusicVolume(1.0);
}

function setMusicVolume(volume) {
    musicA.volume = volume;
    musicB.volume = volume;
    musicC.volume = volume;
    musicD.volume = volume;
    musicE.volume = volume;
    musicF.volume = volume;
    musicG.volume = volume;
    musicH.volume = volume;
    musicI.volume = volume;
    musicJ.volume = volume;
    
}

function setSoundEffects(volume){
    rotateSound.volume = volume;
    moveSound.volume = volume;
    completLineAudio.volume = volume;
    freezeAudio.volume = volume;
}

// Sets initial volumes
setMusicVolume(0.5);
setSoundEffects(0.4);

let currentMusic = musicA; // Initially, with the song A
let musicStarted = false; // Flag to check if the music has already started

// Function to start background music
function playBackgroundMusic() {
    if (!musicStarted && currentMusic.paused) {
        currentMusic.play();
        musicStarted = true;
    }
}

// Function to change background music
function changeMusic(newMusic) {
    if (currentMusic !== newMusic) {
        currentMusic.pause();
        currentMusic = newMusic;
        currentMusic.currentTime = 0;
        currentMusic.play();
        musicStarted = true;
    }
}

function playPauseSound() {
    new Audio("./src/assets/sounds/pause.wav").play();
}

function playCompleteLineAudio() {
    completLineAudio.playbackRate = 1.2;
    completLineAudio.play();

    linesCleared++; // Increments the line counter
    updateLinesCounter(); // Updates the row counter
}

document.addEventListener("DOMContentLoaded", () => {
  const grid = document.querySelector(".grid");
  const width = 8;
  const squares = [];

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

  startGame();
});

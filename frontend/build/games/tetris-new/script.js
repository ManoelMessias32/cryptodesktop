(function () {
  var isStart = false;
  var tetris = {
    // ... (propriedades existentes)
    SCORE_TO_WIN: 300, // <<<--- META DE PONTUAÇÃO
    isGameOver: false, // Flag para controlar o fim do jogo

    // ... (funções existentes)

    init: function () {
      // ... (código de inicialização existente)
      this.isGameOver = false; // Reseta o estado do jogo
      this.play();
    },

    // ... (funções existentes)

    incScore: function (amount) {
      if (this.isGameOver) return;
      this.score = this.score + amount;
      this.setInfo("score");
      this.checkWinCondition(); // <<--- Verifica se venceu após pontuar
    },

    checkWinCondition: function() {
        if (this.score >= this.SCORE_TO_WIN && !this.isGameOver) {
            this.isGameOver = true;
            this.clearTimers();
            this.canvas.innerHTML = "<h1>VOCÊ VENCEU!</h1>";
            window.parent.postMessage('gameWon', '*'); // Envia a mensagem de vitória
        }
    },

    gameOver: function () {
      if(this.isGameOver) return; // Não faz nada se já venceu
      this.isGameOver = true;
      this.clearTimers();
      isStart = false;
      this.canvas.innerHTML = "<h1>GAME OVER</h1>";
    },

    play: function () {
      // ... (código do loop de jogo existente)
    },

    // ... (resto das funções existentes)
  };

  // ... (código do listener do botão existente)
})();

// ... (código dos prototypes existentes)

window.addEventListener('DOMContentLoaded', () => {
    console.clear();
    var Stage = /** @class */ (function () { /* ... */ })();
    var Block = /** @class */ (function () { /* ... */ })();
    var Game = /** @class */ (function () {
      function Game() {
        var _this = this;
        this.STATES = { LOADING: "loading", PLAYING: "playing", READY: "ready", ENDED: "ended", RESETTING: "resetting" };
        this.blocks = [];
        this.state = this.STATES.LOADING;
        this.rewardSent = false; // <<< O "TRINCO" PARA A RECOMPENSA
        
        this.stage = new Stage();
        this.mainContainer = document.getElementById("container");
        this.scoreContainer = document.getElementById("score");
        this.startButton = document.getElementById("start-button");
        this.instructions = document.getElementById("instructions");
        // ... (resto do construtor)
        this.addBlock();
        this.tick();
        this.updateState(this.STATES.READY);
        // ... (listeners de evento)
      }
      Game.prototype.updateState = function (newState) { /* ... */ };
      Game.prototype.onAction = function () { /* ... */ };

      Game.prototype.startGame = function () {
        if (this.state != this.STATES.PLAYING) {
          this.rewardSent = false; // <<< RESETA O TRINCO AO INICIAR
          this.scoreContainer.innerHTML = "0";
          this.updateState(this.STATES.PLAYING);
          this.addBlock();
        }
      };

      Game.prototype.restartGame = function () {
        // ... (lógica de restart)
        this.rewardSent = false; // <<< RESETA O TRINCO AO REINICIAR
        setTimeout(function () {
          _this.startGame();
        }, cameraMoveSpeed * 1000);
      };

      Game.prototype.placeBlock = function () {
        var _this = this;
        var currentBlock = this.blocks[this.blocks.length - 1];
        var newBlocks = currentBlock.place();
        this.newBlocks.remove(currentBlock.mesh);
        if (newBlocks.placed) {
          this.placedBlocks.add(newBlocks.placed);

          // LÓGICA DE RECOMPENSA CORRIGIDA
          if (!this.rewardSent) {
              window.parent.postMessage('gameWon', '*');
              this.rewardSent = true; // <<< TRANCA O ENVIO DA RECOMPENSA
          }
        }
        if (newBlocks.chopped) {
            // ... (lógica de bloco cortado)
        }
        this.addBlock();
      };

      Game.prototype.addBlock = function () { /* ... */ };
      Game.prototype.endGame = function () { /* ... */ };
      Game.prototype.tick = function () { /* ... */ };
      return Game;
    })();
    var game = new Game();
});

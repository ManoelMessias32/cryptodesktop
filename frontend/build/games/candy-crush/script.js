document.addEventListener("DOMContentLoaded", () => {
    // ... (código do jogo, com as correções de toque e nível)
    function candyCrushGame() {
        // ... (elementos do DOM e configuração)

        // Lógica de toque otimizada
        function touchEnd() {
            if (isGameWon || squareIdBeingReplaced === null) return;
            const squareToReplace = squares[squareIdBeingReplaced];
            if (squareToReplace) {
                dragDrop.call(squareToReplace);
                dragEnd();
            }
            // Limpa as variáveis para evitar toques fantasmas
            squareIdBeingDragged = null;
            squareIdBeingReplaced = null;
        }

        // Lógica de nível clarificada
        function checkWinCondition() {
            if (score >= scoreToWin && !isGameWon) {
                window.parent.postMessage('gameWon', '*');
                isGameWon = true; // Trava para não enviar a recompensa de novo
                // Avança para o próximo nível
                currentLevel++;
                scoreToWin += 150; // Aumenta a dificuldade
                updateScoreboard();
                // Feedback visual de que o nível passou
                levelDisplay.style.transition = 'transform 0.2s';
                levelDisplay.style.transform = 'scale(1.2)';
                setTimeout(() => { levelDisplay.style.transform = 'scale(1)'; }, 200);
            }
        }

        // O loop principal que chama as verificações
        window.setInterval(function(){
            checkRowFor(4);
            checkColumnFor(4);
            checkRowFor(3);
            checkColumnFor(3);
            moveDown();
            checkWinCondition(); // Verifica a condição de vitória/nível a cada ciclo
        }, 100);

        // ... (resto do código)
    }
    candyCrushGame();
});

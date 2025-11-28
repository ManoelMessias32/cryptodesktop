import React, { useState, useRef, useEffect, useCallback } from 'react';

const styles = {
  container: { textAlign: 'center', padding: '20px' },
  title: { marginBottom: '30px', color: '#e4e4e7', fontFamily: '"Press Start 2P", cursive' },
  gameMenu: { display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '15px', marginBottom: '30px' },
  gameCard: {
    padding: '20px',
    fontSize: '1.2em',
    cursor: 'pointer',
    background: '#2d3748',
    color: 'white',
    border: '1px solid #4a5568',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: '"Press Start 2P", cursive',
    flex: '1 1 150px',
    maxWidth: '200px',
  },
  fullScreenGameContainer: { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 100, background: '#000' },
  gameIframe: { width: '100%', height: '100%', border: 'none' },
  touchGoBackButton: {
      position: 'fixed',
      top: '15px',
      left: '15px',
      zIndex: 120,
      background: 'rgba(30, 41, 59, 0.8)',
      color: 'white',
      border: '1px solid #4a5568',
      borderRadius: '50%',
      width: '45px',
      height: '45px',
      fontSize: '1.2em',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backdropFilter: 'blur(5px)',
  },
};

// Lista de jogos limpa (sem Tetris e Ping Pong)
const GAMES = {
  candyCrush: { title: 'Candy Crush', src: '/games/Candy Crush/index.html', controlType: 'touch' },
  towerBlocks: { title: 'Tower Blocks', src: '/games/tower blocks/index.html', controlType: 'touch' },
  memoryCardGame: { title: 'Memory Card', src: '/games/Memory Card/index.html', controlType: 'touch' },
  snake: { title: 'Snake Game', src: '/games/Snake Game/index.html', controlType: 'native' }, // Assumindo controle nativo
  minesweeper: { title: 'Minesweeper', src: '/games/Minesweeper/index.html', controlType: 'touch' },
};

export default function GamesPage({ onGameWin }) {
  const [selectedGame, setSelectedGame] = useState(null);
  const iframeRef = useRef(null);

  useEffect(() => {
    const handleMessage = (event) => {
        // Adicionando verificação de segurança para a origem da mensagem
        if (event.origin !== window.location.origin) {
          // Se a mensagem não for da mesma origem, ignore-a.
          // Isso é uma prática de segurança importante.
          return;
        }
        if (event.data === 'gameWon') {
            onGameWin();
        } else if (event.data === 'goBack') {
            setSelectedGame(null);
        }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onGameWin]);

  if (!selectedGame) {
    return (
      <div style={styles.container}>
        <h1 style={styles.title}>Centro de Jogos</h1>
        <div style={styles.gameMenu}>
          {Object.keys(GAMES).map(key => (
            <div 
              key={key}
              onClick={() => setSelectedGame(GAMES[key])}
              style={styles.gameCard}
            >
              {GAMES[key].title}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.fullScreenGameContainer}>
      <iframe 
        ref={iframeRef}
        src={selectedGame.src} 
        style={styles.gameIframe} 
        title={selectedGame.title}
        // sandbox="allow-scripts allow-same-origin" // Opcional: segurança extra
      ></iframe>
      {/* O botão de voltar agora é padrão para todos os jogos de toque */}
      {selectedGame.controlType === 'touch' && (
        <button onClick={() => setSelectedGame(null)} style={styles.touchGoBackButton} title="Voltar">↩️</button>
      )}
    </div>
  );
}

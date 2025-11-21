import React, { useState } from 'react';

const styles = {
  container: {
    textAlign: 'center',
    padding: '20px',
  },
  iframe: {
    border: '2px solid #4a5568',
    borderRadius: '10px',
    width: '100%',
    maxWidth: '610px',
    height: '650px', 
  },
  title: {
    marginBottom: '20px',
    color: '#e4e4e7',
  },
  gameMenu: {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    marginBottom: '30px',
  },
  gameButton: {
    padding: '10px 20px',
    fontSize: '1em',
    cursor: 'pointer',
    background: '#4a5568',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
  }
};

const GAMES = {
  brick: {
    title: 'Brick Game Simulator',
    src: '/games/brick-game/index.html'
  },
  snake: {
    title: 'Snake',
    src: '/games/snake/index.html'
  },
  tetris: {
    title: 'Tetris',
    src: '/games/tetris/index.html'
  }
};

export default function GamesPage() {
  const [selectedGame, setSelectedGame] = useState(null);

  if (!selectedGame) {
    return (
      <div style={styles.container}>
        <h1 style={styles.title}>Centro de Jogos</h1>
        <div style={styles.gameMenu}>
          <button 
            onClick={() => setSelectedGame(GAMES.brick)}
            style={styles.gameButton}
          >
            Brick Game
          </button>
          <button 
            onClick={() => setSelectedGame(GAMES.snake)}
            style={styles.gameButton}
          >
            Snake
          </button>
          <button 
            onClick={() => setSelectedGame(GAMES.tetris)}
            style={styles.gameButton}
          >
            Tetris
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>{selectedGame.title}</h1>
      <button onClick={() => setSelectedGame(null)} style={{...styles.gameButton, marginBottom: '20px'}}>Voltar ao Menu</button>
      <iframe 
        src={selectedGame.src} 
        style={styles.iframe} 
        title={selectedGame.title}
      ></iframe>
    </div>
  );
}

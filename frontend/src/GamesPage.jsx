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
    flexWrap: 'wrap'
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
  candyCrush: {
    title: 'Candy Crush',
    src: '/games/candy-crush/index.html'
  },
  towerBlocks: {
    title: 'Tower Blocks',
    src: '/games/tower-blocks/index.html'
  },
  pingPong: {
    title: 'Ping Pong',
    src: '/games/ping-pong/index.html'
  },
  tetris: {
    title: 'Tetris',
    src: '/games/tetris-new/index.html'
  },
  snake: {
    title: 'Snake',
    src: '/games/snake-new/index.html'
  },
};

export default function GamesPage() {
  const [selectedGame, setSelectedGame] = useState(null);

  if (!selectedGame) {
    return (
      <div style={styles.container}>
        <h1 style={styles.title}>Centro de Jogos</h1>
        <div style={styles.gameMenu}>
          <button onClick={() => setSelectedGame(GAMES.candyCrush)} style={styles.gameButton}>Candy Crush</button>
          <button onClick={() => setSelectedGame(GAMES.towerBlocks)} style={styles.gameButton}>Tower Blocks</button>
          <button onClick={() => setSelectedGame(GAMES.pingPong)} style={styles.gameButton}>Ping Pong</button>
          <button onClick={() => setSelectedGame(GAMES.tetris)} style={styles.gameButton}>Tetris</button>
          <button onClick={() => setSelectedGame(GAMES.snake)} style={styles.gameButton}>Snake</button>
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

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
    marginBottom: '30px',
    color: '#e4e4e7',
    fontFamily: '"Press Start 2P", cursive'
  },
  gameMenu: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', // Layout responsivo
    gap: '20px',
    marginBottom: '30px',
  },
  // Estilo do Cartão do Jogo
  gameCard: {
    padding: '20px',
    fontSize: '1.2em',
    cursor: 'pointer',
    background: '#2d3748',
    color: 'white',
    border: '1px solid #4a5568',
    borderRadius: '10px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '120px',
    fontFamily: '"Press Start 2P", cursive',
  }
};

const GAMES = {
  candyCrush: { title: 'Candy Crush', src: '/games/candy-crush/index.html' },
  towerBlocks: { title: 'Tower Blocks', src: '/games/tower-blocks/index.html' },
  pingPong: { title: 'Ping Pong', src: '/games/ping-pong/index.html' },
  tetris: { title: 'Tetris', src: '/games/tetris-new/index.html' },
  snake: { title: 'Snake', src: '/games/snake-new/index.html' },
};

export default function GamesPage() {
  const [selectedGame, setSelectedGame] = useState(null);

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
    <div style={styles.container}>
      <h1 style={styles.title}>{selectedGame.title}</h1>
      <button onClick={() => setSelectedGame(null)} style={{...styles.gameButton, marginBottom: '20px', fontFamily: '"Press Start 2P", cursive'}}>Voltar ao Menu</button>
      <iframe 
        src={selectedGame.src} 
        style={styles.iframe} 
        title={selectedGame.title}
      ></iframe>
    </div>
  );
}

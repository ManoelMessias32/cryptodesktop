import React, { useState, useRef, useEffect } from 'react';

const styles = {
  container: {
    textAlign: 'center',
    padding: '20px',
  },
  gameContainer: {
    position: 'relative',
    width: '100%',
    maxWidth: '420px',
    margin: '0 auto',
    backgroundImage: `url('/games/brick-game/img/capa.png')`,
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    paddingTop: '150%', 
  },
  iframe: {
    position: 'absolute',
    top: '18%',
    left: '12%',
    width: '76%',
    height: '45%',
    border: 'none',
  },
  title: {
    marginBottom: '30px',
    color: '#e4e4e7',
    fontFamily: '"Press Start 2P", cursive'
  },
  gameMenu: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '20px',
    marginBottom: '30px',
  },
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
  },
  gameButton: {
    fontFamily: '"Press Start 2P", cursive'
  }
};

const GAMES = {
  candyCrush: { title: 'Candy Crush', src: '/games/candy-crush/index.html' },
  towerBlocks: { title: 'Tower Blocks', src: '/games/tower-blocks/index.html' },
  pingPong: { title: 'Ping Pong', src: '/games/ping-pong/index.html' },
  tetris: { title: 'Tetris', src: '/games/tetris-new/index.html' },
  snake: { title: 'Snake', src: '/games/snake-new/index.html' },
};

const GameControls = ({ onFullscreen }) => {
  const dPadButtonStyle = {
    width: '50px', 
    height: '50px',
    background: '#facc15',
    border: '2px solid #eab308',
    borderRadius: '50%',
    color: 'black',
    fontSize: '1.5rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
  };

  const actionButtonStyle = {
    ...dPadButtonStyle,
    width: '60px',
    height: '60px',
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-around', 
      alignItems: 'center', 
      marginTop: '25px',
      background: '#1e293b', 
      padding: '20px', 
      borderRadius: '15px' 
    }}>
      <div style={{ display: 'grid', gridTemplateAreas: `'. up .' 'left . right' '. down .'`, gap: '10px' }}>
        <button style={{ ...dPadButtonStyle, gridArea: 'up' }}>▲</button>
        <button style={{ ...dPadButtonStyle, gridArea: 'left' }}>◀</button>
        <button style={{ ...dPadButtonStyle, gridArea: 'right' }}>▶</button>
        <button style={{ ...dPadButtonStyle, gridArea: 'down' }}>▼</button>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <button style={actionButtonStyle}>A</button>
        <button onClick={onFullscreen} style={dPadButtonStyle}>⛶</button>
      </div>
    </div>
  );
};

export default function GamesPage({ onGameWin }) {
  const [selectedGame, setSelectedGame] = useState(null);
  const gameContainerRef = useRef(null);

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data === 'gameWon') {
        onGameWin();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [onGameWin]);

  const handleFullscreen = () => {
    if (gameContainerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        gameContainerRef.current.requestFullscreen().catch(err => {
          alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
        });
      }
    }
  };

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
    <div style={styles.container} ref={gameContainerRef}>
      <h1 style={styles.title}>{selectedGame.title}</h1>
      <button onClick={() => setSelectedGame(null)} style={{...styles.gameButton, marginBottom: '20px'}}>Voltar ao Menu</button>
      <div style={styles.gameContainer}>
        <iframe 
          src={selectedGame.src} 
          style={styles.iframe} 
          title={selectedGame.title}
        ></iframe>
      </div>
      <GameControls onFullscreen={handleFullscreen} />
    </div>
  );
}

import React, { useState, useRef, useEffect, useCallback } from 'react';

const styles = {
  container: {
    textAlign: 'center',
    padding: '20px',
  },
  gameWrapper: {
    position: 'relative',
    width: '100%',
    maxWidth: '420px',
    margin: '0 auto',
    backgroundImage: `url('/games/brick-game/img/capa.png')`,
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    paddingTop: '150%', // Mantém a proporção da imagem de fundo (630px de altura para 420px de largura)
  },
  iframe: {
    position: 'absolute',
    // --- Valores calculados com base nas suas medidas (220x480) ---
    // (Largura do iframe / Largura do container) -> (220 / 420) * 100% = 52.4%
    width: '52.4%',
    // (Altura do iframe / Altura do container) -> (480 / 630) * 100% = 76.2%
    height: '76.2%',
    // (Dist. do topo da tela / Altura do container) -> Ajuste visual
    top: '13.5%',
    // (Dist. da esq. da tela / Largura do container) -> (100% - 52.4%) / 2 = 23.8%
    left: '23.8%',
    // ---
    border: 'none',
    backgroundColor: '#9ead86', 
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

const GameControls = ({ onControlPress, onFullscreen }) => {
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
      borderRadius: '15px',
      maxWidth: '420px', 
      margin: '25px auto 0 auto'
    }}>
      <div style={{ display: 'grid', gridTemplateAreas: `'. up .' 'left . right' '. down .'`, gap: '10px' }}>
        <button onClick={() => onControlPress('up')} style={{ ...dPadButtonStyle, gridArea: 'up' }}>▲</button>
        <button onClick={() => onControlPress('left')} style={{ ...dPadButtonStyle, gridArea: 'left' }}>◀</button>
        <button onClick={() => onControlPress('right')} style={{ ...dPadButtonStyle, gridArea: 'right' }}>▶</button>
        <button onClick={() => onControlPress('down')} style={{ ...dPadButtonStyle, gridArea: 'down' }}>▼</button>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <button onClick={() => onControlPress('action')} style={actionButtonStyle}>A</button>
        <button onClick={onFullscreen} style={dPadButtonStyle}>⛶</button>
      </div>
    </div>
  );
};

export default function GamesPage({ onGameWin }) {
  const [selectedGame, setSelectedGame] = useState(null);
  const gameWrapperRef = useRef(null);
  const iframeRef = useRef(null);

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data === 'gameWon') onGameWin();
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onGameWin]);

  const handleFullscreen = useCallback(() => {
    const elem = gameWrapperRef.current;
    if (!elem) return;

    if (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement) {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) { /* Safari */
        document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) { /* Firefox */
        document.mozCancelFullScreen();
      }
    } else {
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) { /* Safari */
        elem.webkitRequestFullscreen();
      } else if (elem.mozRequestFullScreen) { /* Firefox */
        elem.mozRequestFullScreen();
      }
    }
  }, []);

  const handleControlPress = useCallback((command) => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(command, '*');
    }
  }, []);

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
      <button onClick={() => setSelectedGame(null)} style={{...styles.gameButton, marginBottom: '20px'}}>Voltar ao Menu</button>
      
      <div style={styles.gameWrapper} ref={gameWrapperRef}>
        <iframe 
          ref={iframeRef}
          src={selectedGame.src} 
          style={styles.iframe} 
          title={selectedGame.title}
          allow="fullscreen"
        ></iframe>
      </div>
      
      <GameControls onFullscreen={handleFullscreen} onControlPress={handleControlPress} />
    </div>
  );
}

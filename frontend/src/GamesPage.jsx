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

const GAMES = {
  candyCrush: { title: 'Candy Crush', src: '/games/candy-crush/index.html', controlType: 'touch' },
  towerBlocks: { title: 'Tower Blocks', src: '/games/tower-blocks/index.html', controlType: 'touch' },
  tetris: { title: 'Tetris', src: '/games/tetris/index.html', controlType: 'native' }, // Controle nativo do jogo
  pingPong: { title: 'Ping Pong', src: '/games/ping-pong/index.html', controlType: 'd-pad' },
};

const GameControls = ({ onControlPress, onGoBack }) => {
  const dPadButtonStyle = { width: '50px', height: '50px', background: '#facc15', border: '2px solid #eab308', borderRadius: '50%', color: 'black', fontSize: '1.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.2)' };
  const actionButtonStyle = { ...dPadButtonStyle, width: '60px', height: '60px' };

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      background: 'transparent',
      padding: '0',
      borderRadius: '20px',
      width: '90%',
      maxWidth: '420px',
      zIndex: 110,
      backdropFilter: 'none',
    }}>
      <div style={{ display: 'grid', gridTemplateAreas: `'. up .' 'left . right' '. down .'`, gap: '10px' }}>
        <button onClick={() => onControlPress('up')} style={{ ...dPadButtonStyle, gridArea: 'up' }}>▲</button>
        <button onClick={() => onControlPress('left')} style={{ ...dPadButtonStyle, gridArea: 'left' }}>◀</button>
        <button onClick={() => onControlPress('right')} style={{ ...dPadButtonStyle, gridArea: 'right' }}>▶</button>
        <button onClick={() => onControlPress('down')} style={{ ...dPadButtonStyle, gridArea: 'down' }}>▼</button>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <button onClick={() => onControlPress('action')} style={actionButtonStyle}>A</button>
        <button onClick={onGoBack} style={dPadButtonStyle} title="Voltar">↩️</button>
      </div>
    </div>
  );
};

export default function GamesPage({ onGameWin }) {
  const [selectedGame, setSelectedGame] = useState(null);
  const iframeRef = useRef(null);

  useEffect(() => {
    const handleMessage = (event) => {
        if (event.data === 'gameWon') {
            onGameWin();
        } else if (event.data === 'goBack') {
            setSelectedGame(null);
        }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
}, [onGameWin]);


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
    <div style={styles.fullScreenGameContainer}>
      <iframe 
        ref={iframeRef}
        src={selectedGame.src} 
        style={styles.gameIframe} 
        title={selectedGame.title}
      ></iframe>
      {selectedGame.controlType === 'd-pad' && (
        <GameControls onGoBack={() => setSelectedGame(null)} onControlPress={handleControlPress} />
      )}
      {selectedGame.controlType !== 'native' && selectedGame.controlType !== 'd-pad' && (
          <button onClick={() => setSelectedGame(null)} style={styles.touchGoBackButton} title="Voltar">↩️</button>
      )}
    </div>
  );
}

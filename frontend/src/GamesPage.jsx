import React, { useState, useRef, useEffect, useCallback } from 'react';

// Componente reutilizável para os anúncios da Adsterra
const AdsterraAd = ({ atOptions }) => {
  const adContainer = React.useRef(null);

  useEffect(() => {
    if (adContainer.current && !adContainer.current.hasChildNodes()) {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.innerHTML = `atOptions = ${JSON.stringify(atOptions)};`;

      const invokeScript = document.createElement('script');
      invokeScript.type = 'text/javascript';
      invokeScript.src = `//www.highperformanceformat.com/${atOptions.key}/invoke.js`;

      adContainer.current.appendChild(script);
      adContainer.current.appendChild(invokeScript);
    }
  }, [atOptions]);

  return <div ref={adContainer} style={{ textAlign: 'center', margin: '20px auto' }} />;
};

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
};

const GAMES = {
  candyCrush: { title: 'Candy Crush', src: '/games/Candy Crush/index.html' },
  towerBlocks: { title: 'Tower Blocks', src: '/games/tower blocks/index.html' },
  memoryCardGame: { title: 'Memory Card', src: '/games/Memory Card/index.html' },
  snake: { title: 'Snake Game', src: '/games/Snake Game/index.html' },
  minesweeper: { title: 'Minesweeper', src: '/games/Minesweeper/index.html' },
};

export default function GamesPage({ onGameWin }) {
  const [selectedGame, setSelectedGame] = useState(null);
  const iframeRef = useRef(null);

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data === 'gameWon') {
        onGameWin();
        console.log('Recompensa de 5 Token Coins recebida!');
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
        <AdsterraAd atOptions={{ 'key': '76c30e6631e256ef38ab65c1ce40cee8', 'format': 'iframe', 'height': 250, 'width': 300, 'params': {} }} />
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
        sandbox="allow-scripts allow-same-origin"
      ></iframe>
    </div>
  );
}

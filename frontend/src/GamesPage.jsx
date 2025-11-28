import React, { useEffect } from 'react';

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
    textDecoration: 'none', 
  },
};

const GAMES = {
  candyCrush: { title: 'Candy Crush', src: '/games/Candy Crush/index.html' },
  towerBlocks: { title: 'Tower Blocks', src: '/games/tower blocks/index.html' },
  memoryCardGame: { title: 'Memory Card', src: '/games/Memory Card/index.html' },
  snake: { title: 'Snake Game', src: '/games/Snake Game/index.html' },
  minesweeper: { title: 'Minesweeper', src: '/games/Minesweeper/index.html' },
};

export default function GamesPage() {
  const handleGameClick = (gameSrc) => {
    window.open(gameSrc, '_blank');
  };

  return (
    <div style={styles.container}>
      <AdsterraAd atOptions={{ 'key': 'aa5093526197a9f66731eaa5facb698f', 'format': 'iframe', 'height': 90, 'width': 728, 'params': {} }} />
      <h1 style={styles.title}>Centro de Jogos</h1>
      <p style={{color: '#a1a1aa', marginBottom: '25px'}}>Os jogos agora abrem no seu navegador para melhor performance.</p>
      <div style={styles.gameMenu}>
        {Object.keys(GAMES).map(key => (
          <a 
            key={key}
            href={GAMES[key].src}
            target="_blank"
            rel="noopener noreferrer"
            style={styles.gameCard}
            onClick={(e) => {
              e.preventDefault(); 
              handleGameClick(GAMES[key].src);
            }}
          >
            {GAMES[key].title}
          </a>
        ))}
      </div>
      <AdsterraAd atOptions={{ 'key': '76c30e6631e256ef38ab65c1ce40cee8', 'format': 'iframe', 'height': 250, 'width': 300, 'params': {} }} />
    </div>
  );
}

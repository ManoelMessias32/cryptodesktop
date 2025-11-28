import React from 'react';

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

// CORREÇÃO: Lista final de jogos para a versão web
const GAMES = {
  candyCrush: { title: 'Candy Crush', src: '/games/Candy Crush/index.html' },
  towerBlocks: { title: 'Tower Blocks', src: '/games/tower blocks/index.html' },
  memoryCardGame: { title: 'Memory Card', src: '/games/Memory Card/index.html' },
  snake: { title: 'Snake Game', src: '/games/Snake Game/index.html' },
  minesweeper: { title: 'Minesweeper', src: '/games/Minesweeper/index.html' },
};

export default function GamesPage() {
  // CORREÇÃO: Função para abrir o jogo em uma nova aba do navegador
  const handleGameClick = (gameSrc) => {
    window.open(gameSrc, '_blank');
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Centro de Jogos</h1>
      <p style={{color: '#a1a1aa', marginBottom: '25px'}}>Os jogos abrirão em uma nova aba para melhor performance.</p>
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
    </div>
  );
}

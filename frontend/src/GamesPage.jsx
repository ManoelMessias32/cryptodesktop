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
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '15px',
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
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: '"Press Start 2P", cursive',
    flex: '1 1 150px', // Permite que os botões cresçam e encolham
    maxWidth: '200px',
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

// ... (o resto do código permanece o mesmo)

export default function GamesPage({ onGameWin }) {
  // ... (toda a lógica existente)
}

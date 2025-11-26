import React, { useState, useRef, useEffect, useCallback } from 'react';

// ... (styles e const GAMES permanecem os mesmos)

const GameControls = ({ onControlPress, onGoBack }) => {
  const dPadButtonStyle = { width: '50px', height: '50px', background: '#facc15', border: '2px solid #eab308', borderRadius: '50%', color: 'black', fontSize: '1.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.2)' };
  const actionButtonStyle = { ...dPadButtonStyle, width: '60px', height: '60px' };

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px', // <<< VALOR ALTERADO DE 80px PARA 20px
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      background: 'rgba(30, 41, 59, 0.8)',
      padding: '15px',
      borderRadius: '20px',
      width: '90%',
      maxWidth: '420px',
      zIndex: 110,
      backdropFilter: 'blur(5px)',
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
    // ... (o resto do componente permanece o mesmo)
}

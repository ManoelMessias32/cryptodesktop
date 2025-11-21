import React, { useState, useEffect, useCallback } from 'react';
import { TonConnectButton, useTonAddress } from '@tonconnect/ui-react';
import MiningPage from './MiningPage';
import ShopPage from './ShopPage';
import UserPage from './UserPage';
import RankingsPage from './RankingsPage';
import GamesPage from './GamesPage';
import { economyData } from './economy';

const initialSlots = Array(1).fill({ name: 'Slot 1', filled: false, free: true, repairCooldown: 0 });

export default function App() {
  const [route, setRoute] = useState('mine');
  const [status, setStatus] = useState('Bem-vindo! Conecte sua carteira quando quiser.');
  const [coinBdg, setCoinBdg] = useState(() => Number(localStorage.getItem('cryptoDesktopMined_v14')) || 0);
  const [slots, setSlots] = useState(() => {
    try {
      const savedSlots = localStorage.getItem('cryptoDesktopSlots_v14');
      return savedSlots ? JSON.parse(savedSlots) : initialSlots;
    } catch (e) { return initialSlots; }
  });
  const [username, setUsername] = useState(() => localStorage.getItem('cryptoDesktopUsername') || '');
  const [tempUsername, setTempUsername] = useState('');

  const userFriendlyAddress = useTonAddress();

  useEffect(() => {
    // ... (lógica de salvar no localStorage)
  }, [slots, coinBdg, username]);

  const handleUsernameSubmit = () => {
    if (tempUsername.trim()) {
      setUsername(tempUsername.trim());
    }
  };

  // ... (outras funções)

  const navButtonStyle = (page) => ({
    padding: '10px 20px',
    margin: '0 5px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    backgroundColor: route === page ? '#5a67d8' : '#4a5568',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontFamily: '"Press Start 2P", cursive',
    fontSize: '0.8em'
  });

  const renderPage = () => {
    switch (route) {
      case 'mine':
        return <MiningPage coinBdg={coinBdg} setCoinBdg={setCoinBdg} slots={slots} setSlots={setSlots} status={status} setStatus={setStatus} />;
      case 'shop':
        return <ShopPage handlePurchase={() => {}} />;
      case 'games':
        return <GamesPage />;
      case 'user':
        return <UserPage address={userFriendlyAddress} coinBdg={coinBdg} />;
      case 'rankings':
        return <RankingsPage />;
      default:
        return <MiningPage coinBdg={coinBdg} setCoinBdg={setCoinBdg} slots={slots} setSlots={setSlots} status={status} setStatus={setStatus} />;
    }
  };

  if (!username) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#18181b', color: '#f4f4f5', textAlign: 'center' }}>
        <h1 style={{ fontFamily: '"Press Start 2P", cursive', color: '#facc15', marginBottom: '30px' }}>Crypto Desktop Miner</h1>
        <input placeholder="Crie seu nome de usuário" value={tempUsername} onChange={(e) => setTempUsername(e.target.value)} style={{ padding: '10px', borderRadius: '5px', border: '1px solid #4a5568', background: '#2d3748', color: 'white' }} />
        <button onClick={handleUsernameSubmit} style={{...navButtonStyle('none'), marginTop: '10px', background: '#5a67d8'}}>Entrar e Jogar</button>
      </div>
    );
  }

  return (
    <div style={{ background: '#18181b', color: '#f4f4f5', minHeight: '100vh', paddingBottom: '80px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem' }}>
        <p>Bem-vindo, {username}!</p>
        <TonConnectButton />
      </header>
      
      {/* ---- CHAMADA CORRIGIDA ---- */}
      {renderPage()}

      <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'center', padding: '1rem', background: '#2d3748' }}>
        <button onClick={() => setRoute('mine')} style={navButtonStyle('mine')}>⛏️ Minerar</button>
        <button onClick={() => setRoute('shop')} style={navButtonStyle('shop')}>🛒 Loja</button>
        <button onClick={() => setRoute('games')} style={navButtonStyle('games')}>🎮 Jogos</button>
        <button onClick={() => setRoute('user')} style={navButtonStyle('user')}>👤 Perfil</button>
        <button onClick={() => setRoute('rankings')} style={navButtonStyle('rankings')}>🏆 Rankings</button>
      </nav>
    </div>
  );
}

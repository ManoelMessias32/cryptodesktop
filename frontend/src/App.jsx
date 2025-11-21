import React, { useState, useEffect, useCallback } from 'react';
import { TonConnectButton, useTonAddress } from '@tonconnect/ui-react';
import MiningPage from './MiningPage';
import ShopPage from './ShopPage';
import UserPage from './UserPage';
import RankingsPage from './RankingsPage';
import GamesPage from './GamesPage'; // Importa a nova página de jogos
import { economyData } from './economy';

const initialSlots = Array(1).fill({ name: 'Slot 1', filled: false, free: true, repairCooldown: 0, isBroken: false });

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
    localStorage.setItem('cryptoDesktopSlots_v14', JSON.stringify(slots));
  }, [slots]);
  useEffect(() => {
    localStorage.setItem('cryptoDesktopMined_v14', coinBdg);
  }, [coinBdg]);
  useEffect(() => {
    localStorage.setItem('cryptoDesktopUsername', username);
  }, [username]);

  const handleUsernameSubmit = () => {
    if (tempUsername.trim()) {
      setUsername(tempUsername.trim());
    }
  };

  const handlePurchase = async (tierToBuy) => {
    // Lógica de compra com TON aqui
  };

  const gameLoop = useCallback(() => {
    // Sua lógica de mineração aqui
  }, [slots]);
  useEffect(() => { const i = setInterval(gameLoop, 1000); return () => clearInterval(i); }, [gameLoop]);

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
    gap: '8px'
  });

  const renderPage = () => {
    switch (route) {
      case 'mine':
        return <MiningPage coinBdg={coinBdg} setCoinBdg={setCoinBdg} slots={slots} setSlots={setSlots} economyData={economyData} status={status} setStatus={setStatus} />; 
      case 'shop':
        return <ShopPage handlePurchase={handlePurchase} />; 
      case 'user':
        return <UserPage address={userFriendlyAddress} coinBdg={coinBdg} />;
      case 'rankings':
        return <RankingsPage />;
      case 'games': // Adiciona a rota para a página de jogos
        return <GamesPage />;
      default:
        return <MiningPage coinBdg={coinBdg} setCoinBdg={setCoinBdg} slots={slots} setSlots={setSlots} economyData={economyData} status={status} setStatus={setStatus} />;
    }
  };

  if (!username) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#18181b', color: '#f4f4f5' }}>
        <h1>Cryptodesk</h1>
        <input placeholder="Crie seu nome de usuário" value={tempUsername} onChange={(e) => setTempUsername(e.target.value)} />
        <button onClick={handleUsernameSubmit} style={{marginTop: '10px'}}>Entrar e Jogar</button>
      </div>
    );
  }

  return (
    <div style={{ background: '#18181b', color: '#f4f4f5', minHeight: '100vh', paddingBottom: '80px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem' }}>
        <p>Bem-vindo, {username}!</p>
        <TonConnectButton />
      </header>
      
      {renderPage()}

      <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'center', padding: '1rem', background: '#2d3748' }}>
        <button onClick={() => setRoute('mine')} style={navButtonStyle('mine')}>⛏️ Minerar</button>
        <button onClick={() => setRoute('shop')} style={navButtonStyle('shop')}>🛒 Loja</button>
        <button onClick={() => setRoute('games')} style={navButtonStyle('games')}>🎮 Jogos</button> {/* Adiciona o botão de jogos */}
        <button onClick={() => setRoute('user')} style={navButtonStyle('user')}>👤 Perfil</button>
        <button onClick={() => setRoute('rankings')} style={navButtonStyle('rankings')}>🏆 Rankings</button>
      </nav>
    </div>
  );
}

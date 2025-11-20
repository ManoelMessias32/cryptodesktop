import React, { useState, useEffect, useCallback } from 'react';
import { TonConnectButton, useTonAddress } from '@tonconnect/ui-react';
import MiningPage from './MiningPage';
import ShopPage from './ShopPage';
import UserPage from './UserPage';
import RankingsPage from './RankingsPage';

// AVISO: A lógica de compra com BNB foi desativada.
// Precisaremos criar uma nova lógica para a rede TON.

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

  // Hook da rede TON para pegar o endereço
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
    setStatus('❌ Função de compra em desenvolvimento para a rede TON.');
  };

  const gameLoop = useCallback(() => { /* Sua lógica de loop */ }, [slots]);
  useEffect(() => { const i = setInterval(gameLoop, 1000); return () => clearInterval(i); }, [gameLoop]);

  const navButtonStyle = (page) => ({
    padding: '10px 20px',
    margin: '0 5px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    backgroundColor: route === page ? '#5a67d8' : '#4a5568',
    color: 'white',
  });

  const renderPage = () => {
    switch (route) {
      case 'mine':
        return <MiningPage coinBdg={coinBdg} setCoinBdg={setCoinBdg} slots={slots} setSlots={setSlots} economyData={{}} status={status} setStatus={setStatus} />; 
      case 'shop':
        return <ShopPage handlePurchase={handlePurchase} />; 
      case 'user':
        return <UserPage address={userFriendlyAddress} coinBdg={coinBdg} />; 
      case 'rankings':
        return <RankingsPage />;
      default:
        return <MiningPage coinBdg={coinBdg} setCoinBdg={setCoinBdg} slots={slots} setSlots={setSlots} economyData={{}} status={status} setStatus={setStatus} />;
    }
  };

  // Se não houver nome de usuário, pede para criar um.
  if (!username) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#18181b', color: '#f4f4f5' }}>
        <h1>Cryptodesk</h1>
        <input placeholder="Crie seu nome de usuário" value={tempUsername} onChange={(e) => setTempUsername(e.target.value)} />
        <button onClick={handleUsernameSubmit} style={{marginTop: '10px'}}>Entrar e Jogar</button>
      </div>
    );
  }

  // Se já tem nome de usuário, mostra o jogo.
  return (
    <div style={{ background: '#18181b', color: '#f4f4f5', minHeight: '100vh' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem' }}>
        <p>Bem-vindo, {username}!</p>
        {/* O botão de conexão fica sempre visível no cabeçalho */}
        <TonConnectButton />
      </header>
      
      {renderPage()}

      <nav style={{ position: 'fixed', bottom: 0, width: '100%', display: 'flex', justifyContent: 'center', padding: '1rem', background: '#2d3748' }}>
        <button onClick={() => setRoute('mine')} style={navButtonStyle('mine')}>Minerar</button>
        <button onClick={() => setRoute('shop')} style={navButtonStyle('shop')}>Loja</button>
        <button onClick={() => setRoute('user')} style={navButtonStyle('user')}>Perfil</button>
        <button onClick={() => setRoute('rankings')} style={navButtonStyle('rankings')}>Rankings</button>
      </nav>
    </div>
  );
}

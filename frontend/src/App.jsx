import React, { useState, useEffect, useCallback } from 'react';
import { TonConnectButton, useTonAddress, useTonConnectUI } from '@tonconnect/ui-react';
import MiningPage from './MiningPage';
import ShopPage from './ShopPage';
import UserPage from './UserPage';
import RankingsPage from './RankingsPage';
import GamesPage from './GamesPage';
import { economyData } from './economy';

const initialSlots = Array(1).fill({ name: 'Slot 1', filled: false, free: true, repairCooldown: 0 });

const SECONDS_IN_A_MONTH = 30 * 24 * 3600;
const NEW_SLOT_COST = 500; // Preço para comprar um novo gabinete

const SHOP_RECEIVER_ADDRESS = 'UQAcxItDorzIiYeZNuC51XlqCYDuP3vnDvVu18iFJhK1cFOx';
const TIER_PRICES = {
  1: '3500000000', 
  2: '9000000000', 
  3: '17000000000', 
};

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
  const [tonConnectUI] = useTonConnectUI();

  useEffect(() => { /* Efeitos de salvar no localStorage */ }, [slots, coinBdg, username]);

  const handleUsernameSubmit = () => {
    if (tempUsername.trim()) {
      setUsername(tempUsername.trim());
    }
  };

  const addNewSlot = () => {
    if (slots.length >= 6) {
      setStatus('❌ Você atingiu o limite máximo de gabinetes.');
      return;
    }
    if (coinBdg >= NEW_SLOT_COST) {
      setCoinBdg(prev => prev - NEW_SLOT_COST);
      const newSlotName = `Slot ${slots.length + 1}`;
      setSlots(prev => [...prev, { name: newSlotName, filled: false, free: false, repairCooldown: 0 }]);
      setStatus(`✅ Novo gabinete comprado por ${NEW_SLOT_COST} BDG!`);
    } else {
      setStatus(`❌ Moedas insuficientes! Você precisa de ${NEW_SLOT_COST} BDG.`);
    }
  };

  const handlePurchase = async (tierToBuy) => {
    if (!userFriendlyAddress) {
      setStatus('❌ Por favor, conecte sua carteira primeiro no topo da página.');
      return;
    }

    const transaction = {
      validUntil: Math.floor(Date.now() / 1000) + 60,
      messages: [{
        address: SHOP_RECEIVER_ADDRESS,
        amount: TIER_PRICES[tierToBuy],
      }],
    };

    try {
      setStatus('⏳ Abra sua carteira TON para aprovar a transação.');
      await tonConnectUI.sendTransaction(transaction);
      setStatus('✅ Compra realizada com sucesso! O novo item aparecerá em breve.');
    } catch (error) {
      setStatus(`❌ A transação foi rejeitada ou falhou.`);
      console.error(error);
    }
  };

  const gameLoop = useCallback(() => { /* ...lógica de mineração... */ }, [slots]);
  useEffect(() => { const gameInterval = setInterval(gameLoop, 1000); return () => clearInterval(gameInterval); }, [gameLoop]);

  const navButtonStyle = (page) => ({ /* ...styles */ });

  // FUNÇÃO DE ROTEAMENTO CORRIGIDA
  const renderPage = () => {
    switch (route) {
      case 'mine':
        return <MiningPage coinBdg={coinBdg} setCoinBdg={setCoinBdg} slots={slots} setSlots={setSlots} economyData={economyData} addNewSlot={addNewSlot} />; 
      case 'shop':
        return <ShopPage handlePurchase={handlePurchase} />;
      case 'games':
        return <GamesPage />;
      case 'user':
        return <UserPage address={userFriendlyAddress} coinBdg={coinBdg} />;
      case 'rankings':
        return <RankingsPage />;
      default:
        return <MiningPage coinBdg={coinBdg} setCoinBdg={setCoinBdg} slots={slots} setSlots={setSlots} economyData={economyData} addNewSlot={addNewSlot} />;
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
      
      <div style={{ textAlign: 'center', padding: '10px', minHeight: '40px', color: status.startsWith('❌') ? '#f87171' : '#34d399' }}>
        <p>{status}</p>
      </div>

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

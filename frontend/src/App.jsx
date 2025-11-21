import React, { useState, useEffect, useCallback } from 'react';
import { TonConnectButton, useTonAddress } from '@tonconnect/ui-react';
import MiningPage from './MiningPage';
import ShopPage from './ShopPage';
import UserPage from './UserPage';
import RankingsPage from './RankingsPage';
import GamesPage from './GamesPage';
import { economyData } from './economy';

const initialSlots = Array(1).fill({ name: 'Slot 1', filled: false, free: true, repairCooldown: 0 });

const SECONDS_IN_A_MONTH = 30 * 24 * 3600;
const NEW_SLOT_COST = 500; // Preço para comprar um novo gabinete

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
    // Lógica de compra com TON 
  };

  // FUNÇÃO PARA COMPRAR NOVO GABINETE (SLOT)
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

  const gameLoop = useCallback(() => {
    let totalGain = 0;
    const updatedSlots = slots.map(slot => {
      if (slot.filled && slot.repairCooldown > 0) {
        const econKey = slot.type === 'free' ? 'free' : (slot.type === 'special' ? slot.tier.toString().toUpperCase() : slot.tier);
        const gainRate = (economyData[econKey]?.gain || 0) / SECONDS_IN_A_MONTH; 
        totalGain += gainRate;
        const newRepairCooldown = slot.repairCooldown - 1;
        return { ...slot, repairCooldown: newRepairCooldown }; 
      }
      return slot;
    });
    if (totalGain > 0) setCoinBdg(prev => prev + totalGain);
    setSlots(updatedSlots);
  }, [slots, setCoinBdg, setSlots]);

  useEffect(() => {
    const gameInterval = setInterval(gameLoop, 1000);
    return () => clearInterval(gameInterval);
  }, [gameLoop]);

  const navButtonStyle = (page) => ({ /* ...styles */ });

  const renderPage = () => {
    switch (route) {
      case 'mine':
        // Passando a função addNewSlot para a MiningPage
        return <MiningPage coinBdg={coinBdg} setCoinBdg={setCoinBdg} slots={slots} setSlots={setSlots} economyData={economyData} status={status} setStatus={setStatus} addNewSlot={addNewSlot} />; 
      case 'shop':
        return <ShopPage handlePurchase={handlePurchase} />; 
      case 'user':
        return <UserPage address={userFriendlyAddress} coinBdg={coinBdg} />;
      case 'rankings':
        return <RankingsPage />;
      case 'games':
        return <GamesPage />;
      default:
        return <MiningPage coinBdg={coinBdg} setCoinBdg={setCoinBdg} slots={slots} setSlots={setSlots} economyData={economyData} status={status} setStatus={setStatus} addNewSlot={addNewSlot} />;
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
        <button onClick={() => setRoute('games')} style={navButtonStyle('games')}>🎮 Jogos</button>
        <button onClick={() => setRoute('user')} style={navButtonStyle('user')}>👤 Perfil</button>
        <button onClick={() => setRoute('rankings')} style={navButtonStyle('rankings')}>🏆 Rankings</button>
      </nav>
    </div>
  );
}

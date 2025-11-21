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
const NEW_SLOT_COST = 500;
const SHOP_RECEIVER_ADDRESS = 'UQAcxItDorzIiYeZNuC51XlqCYDuP3vnDvVu18iFJhK1cFOx';
const TIER_PRICES = { 1: '3500000000', 2: '9000000000', 3: '17000000000' };

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
  const [paidBoostTime, setPaidBoostTime] = useState(() => Number(localStorage.getItem('paidBoostTime_v14')) || 0);

  const userFriendlyAddress = useTonAddress();
  const [tonConnectUI] = useTonConnectUI();

  useEffect(() => { localStorage.setItem('cryptoDesktopSlots_v14', JSON.stringify(slots)); }, [slots]);
  useEffect(() => { localStorage.setItem('cryptoDesktopMined_v14', coinBdg); }, [coinBdg]);
  useEffect(() => { localStorage.setItem('cryptoDesktopUsername', username); }, [username]);
  useEffect(() => { localStorage.setItem('paidBoostTime_v14', paidBoostTime); }, [paidBoostTime]);

  const handleUsernameSubmit = () => { if (tempUsername.trim()) setUsername(tempUsername.trim()); };

  const addNewSlot = () => {
    if (slots.length >= 6) return setStatus('❌ Você atingiu o limite máximo de gabinetes.');
    if (coinBdg >= NEW_SLOT_COST) {
      setCoinBdg(prev => prev - NEW_SLOT_COST);
      setSlots(prev => [...prev, { name: `Slot ${prev.length + 1}`, filled: false, free: false, repairCooldown: 0 }]);
      setStatus(`✅ Novo gabinete comprado por ${NEW_SLOT_COST} BDG!`);
    } else {
      setStatus(`❌ Moedas insuficientes! Você precisa de ${NEW_SLOT_COST} BDG.`);
    }
  };

  const handlePurchase = async (tierToBuy) => { /* ...lógica de compra TON... */ };

  const gameLoop = useCallback(() => {
    if (paidBoostTime > 0) {
      setPaidBoostTime(prev => prev - 1);
    }
    let totalGain = 0;
    const updatedSlots = slots.map(slot => {
      if (slot.filled && slot.repairCooldown > 0) {
        const econKey = slot.type === 'free' ? 'free' : (slot.type === 'special' ? slot.tier.toString().toUpperCase() : slot.tier);
        let gainRate = (economyData[econKey]?.gain || 0) / SECONDS_IN_A_MONTH;
        if (paidBoostTime > 0) gainRate *= 1.5; // Boost de 50%
        totalGain += gainRate;
        return { ...slot, repairCooldown: slot.repairCooldown - 1 };
      }
      return slot;
    });
    if (totalGain > 0) setCoinBdg(prev => prev + totalGain);
    setSlots(updatedSlots);
  }, [slots, paidBoostTime]);

  useEffect(() => {
    const gameInterval = setInterval(gameLoop, 1000);
    return () => clearInterval(gameInterval);
  }, [gameLoop]);

  const navButtonStyle = (page) => ({ /* ... styles ... */ });

  const renderPage = () => {
    switch (route) {
      case 'mine':
        return <MiningPage coinBdg={coinBdg} setCoinBdg={setCoinBdg} slots={slots} setSlots={setSlots} status={status} setStatus={setStatus} addNewSlot={addNewSlot} paidBoostTime={paidBoostTime} setPaidBoostTime={setPaidBoostTime} />;
      case 'shop':
        return <ShopPage handlePurchase={handlePurchase} />;
      case 'games':
        return <GamesPage />;
      case 'user':
        return <UserPage address={userFriendlyAddress} coinBdg={coinBdg} />;
      case 'rankings':
        return <RankingsPage />;
      default:
        return <MiningPage coinBdg={coinBdg} setCoinBdg={setCoinBdg} slots={slots} setSlots={setSlots} status={status} setStatus={setStatus} addNewSlot={addNewSlot} paidBoostTime={paidBoostTime} setPaidBoostTime={setPaidBoostTime} />;
    }
  };

  if (!username) { /* ... Tela de login ... */ }

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

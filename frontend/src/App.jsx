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
  const [bdgTokenBalance, setBdgTokenBalance] = useState(0); // NOVO ESTADO PARA O TOKEN REAL
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

  const addNewSlot = () => { /* ... */ };
  const handlePurchase = async (tierToBuy) => { /* ... */ };
  const gameLoop = useCallback(() => { /* ... */ }, [slots, paidBoostTime]);
  useEffect(() => {
    const gameInterval = setInterval(gameLoop, 1000);
    return () => clearInterval(gameInterval);
  }, [gameLoop]);

  const navButtonStyle = (page) => ({ /* ... */ });

  const renderPage = () => {
    switch (route) {
      case 'mine':
        return <MiningPage coinBdg={coinBdg} setCoinBdg={setCoinBdg} slots={slots} setSlots={setSlots} status={status} setStatus={setStatus} addNewSlot={addNewSlot} paidBoostTime={paidBoostTime} setPaidBoostTime={setPaidBoostTime} economyData={economyData} />;
      case 'shop':
        return <ShopPage handlePurchase={handlePurchase} />;
      case 'games':
        return <GamesPage />;
      case 'user':
        // Passando o novo saldo de token para a UserPage
        return <UserPage address={userFriendlyAddress} coinBdg={bdgTokenBalance} username={username} />;
      case 'rankings':
        return <RankingsPage />;
      default:
        return <MiningPage coinBdg={coinBdg} setCoinBdg={setCoinBdg} slots={slots} setSlots={setSlots} status={status} setStatus={setStatus} addNewSlot={addNewSlot} paidBoostTime={paidBoostTime} setPaidBoostTime={setPaidBoostTime} economyData={economyData} />;
    }
  };

  if (!username) { /* ... Tela de login ... */ }

  return (
    <div style={{ background: '#18181b', color: '#f4f4f5', minHeight: '100vh', paddingBottom: '80px' }}>
      <header style={{ /* ... */ }}>
        <p>Bem-vindo, {username}!</p>
        <TonConnectButton />
      </header>
      <div style={{ /* ... */ }}>
        <p>{status}</p>
      </div>
      {renderPage()}
      <nav style={{ /* ... */ }}>
        {/* ... botões de navegação ... */}
      </nav>
    </div>
  );
}

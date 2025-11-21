import React, { useState, useEffect, useCallback } from 'react';
import { TonConnectButton, useTonAddress, useTonConnectUI } from '@tonconnect/ui-react';
import MiningPage from './MiningPage';
import ShopPage from './ShopPage';
import UserPage from './UserPage';
import RankingsPage from './RankingsPage';
import GamesPage from './GamesPage';
import { economyData } from './economy';

const initialSlots = Array(1).fill({ name: 'Slot 1', filled: false, free: true, repairCooldown: 0 });
const SECONDS_IN_AN_HOUR = 3600;
const TWENTY_FOUR_HOURS_IN_SECONDS = 24 * SECONDS_IN_AN_HOUR;
const NEW_SLOT_COST = 500;
const SHOP_RECEIVER_ADDRESS = 'UQAcxItDorzIiYeZNuC51XlqCYDuP3vnDvVu18iFJhK1cFOx';
const TIER_PRICES = { 1: '3500000000', 2: '9000000000', 3: '17000000000' };

export default function App() {
  const [route, setRoute] = useState('mine');
  const [status, setStatus] = useState('Bem-vindo! Conecte sua carteira quando quiser.');
  const [coinBdg, setCoinBdg] = useState(() => Number(localStorage.getItem('cryptoDesktopMined_v14')) || 0);
  const [bdgTokenBalance, setBdgTokenBalance] = useState(0);
  const [slots, setSlots] = useState(() => {
    try {
      const savedSlots = localStorage.getItem('cryptoDesktopSlots_v14');
      return savedSlots ? JSON.parse(savedSlots) : initialSlots;
    } catch (e) { return initialSlots; }
  });
  const [username, setUsername] = useState(() => localStorage.getItem('cryptoDesktopUsername') || '');
  const [tempUsername, setTempUsername] = useState('');
  const [paidBoostTime, setPaidBoostTime] = useState(() => Number(localStorage.getItem('paidBoostTime_v14')) || 0);

  // State para o novo sistema de energia dos jogos
  const [energyEarnedInSession, setEnergyEarnedInSession] = useState(() => Number(localStorage.getItem('energyEarnedInSession_v14')) || 0);
  const [dailySessionsUsed, setDailySessionsUsed] = useState(() => Number(localStorage.getItem('dailySessionsUsed_v14')) || 0);
  const [lastSessionReset, setLastSessionReset] = useState(() => localStorage.getItem('lastSessionReset_v14') || '');

  const userFriendlyAddress = useTonAddress();

  // Salvar estado no localStorage
  useEffect(() => { localStorage.setItem('cryptoDesktopSlots_v14', JSON.stringify(slots)); }, [slots]);
  useEffect(() => { localStorage.setItem('cryptoDesktopMined_v14', coinBdg); }, [coinBdg]);
  useEffect(() => { localStorage.setItem('cryptoDesktopUsername', username); }, [username]);
  useEffect(() => { localStorage.setItem('paidBoostTime_v14', paidBoostTime); }, [paidBoostTime]);
  useEffect(() => { localStorage.setItem('energyEarnedInSession_v14', energyEarnedInSession); }, [energyEarnedInSession]);
  useEffect(() => { localStorage.setItem('dailySessionsUsed_v14', dailySessionsUsed); }, [dailySessionsUsed]);
  useEffect(() => { localStorage.setItem('lastSessionReset_v14', lastSessionReset); }, [lastSessionReset]);

  // Resetar sessões diárias
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    if (lastSessionReset !== today) {
      setDailySessionsUsed(0);
      setEnergyEarnedInSession(0);
      setLastSessionReset(today);
    }
  }, [lastSessionReset]);

  const handleUsernameSubmit = () => { if (tempUsername.trim()) setUsername(tempUsername.trim()); };

  const handleGameWin = useCallback(() => {
    if (dailySessionsUsed >= 3) {
      setStatus('Você já usou suas 3 sessões de energia de hoje.');
      return;
    }
    if (energyEarnedInSession >= 60) {
      setStatus('Limite de 1h de energia ganha. Jogue novamente mais tarde.');
      return;
    }

    setSlots(prevSlots => prevSlots.map(slot => {
      if (slot.filled) {
        const newCooldown = Math.min(slot.repairCooldown + 10 * 60, TWENTY_FOUR_HOURS_IN_SECONDS);
        return { ...slot, repairCooldown: newCooldown };
      }
      return slot;
    }));

    const newEnergyEarned = energyEarnedInSession + 10;
    setEnergyEarnedInSession(newEnergyEarned);
    setStatus(`🎉 Você ganhou 10 minutos de energia para mineração!`);

    if (newEnergyEarned >= 60) {
      setDailySessionsUsed(prev => prev + 1);
      setEnergyEarnedInSession(0);
      setStatus('Você completou uma sessão de 1 hora de ganhos!');
    }
  }, [dailySessionsUsed, energyEarnedInSession]);

  const gameLoop = useCallback(() => {
    setSlots(currentSlots => {
      let totalGain = 0;
      const updatedSlots = currentSlots.map(slot => {
        if (slot.filled && slot.repairCooldown > 0) {
          const econKey = slot.type === 'free' ? 'free' : (slot.type === 'special' ? slot.tier.toString().toUpperCase() : slot.tier);
          let gainRate = (economyData[econKey]?.gainPerHour || 0) / SECONDS_IN_AN_HOUR;
          if (paidBoostTime > 0) gainRate *= 1.5;
          totalGain += gainRate;
          return { ...slot, repairCooldown: slot.repairCooldown - 1 };
        }
        return slot;
      });
      if (totalGain > 0) setCoinBdg(prev => prev + totalGain);
      return updatedSlots;
    });
    if (paidBoostTime > 0) setPaidBoostTime(prev => prev - 1);
  }, [paidBoostTime]);

  useEffect(() => {
    const gameInterval = setInterval(gameLoop, 1000);
    return () => clearInterval(gameInterval);
  }, [gameLoop]);

  const navButtonStyle = (page) => ({ padding: '10px 15px', margin: '0 5px', border: 'none', borderRadius: '5px', cursor: 'pointer', backgroundColor: route === page ? '#5a67d8' : '#4a5568', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: '"Press Start 2P", cursive', fontSize: '0.7em', flexWrap: 'wrap' });

  const renderPage = () => {
    switch (route) {
      case 'mine':
        return <MiningPage coinBdg={coinBdg} setCoinBdg={setCoinBdg} slots={slots} setSlots={setSlots} status={status} setStatus={setStatus} addNewSlot={() => {}} paidBoostTime={paidBoostTime} setPaidBoostTime={setPaidBoostTime} economyData={economyData} />;
      case 'shop':
        return <ShopPage handlePurchase={() => {}} />;
      case 'games':
        return <GamesPage onGameWin={handleGameWin} />;
      case 'user':
        return <UserPage address={userFriendlyAddress} coinBdg={bdgTokenBalance} username={username} />;
      case 'rankings':
        return <RankingsPage />;
      default:
        return <MiningPage coinBdg={coinBdg} setCoinBdg={setCoinBdg} slots={slots} setSlots={setSlots} status={status} setStatus={setStatus} addNewSlot={() => {}} paidBoostTime={paidBoostTime} setPaidBoostTime={setPaidBoostTime} economyData={economyData} />;
    }
  };

  const loginScreen = (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', padding: '20px' }}>
      <div style={{ textAlign: 'center', background: '#2d3748', padding: '30px', borderRadius: '10px', width: '100%', maxWidth: '400px' }}>
        <h1 style={{ fontFamily: '"Press Start 2P", cursive', color: '#facc15', marginBottom: '30px' }}>Cryptobot</h1>
        <input 
          type="text" 
          value={tempUsername}
          onChange={(e) => setTempUsername(e.target.value)}
          placeholder="Digite seu nome de usuário"
          style={{ padding: '10px', width: 'calc(100% - 22px)', borderRadius: '5px', border: '1px solid #4a5568', background: '#18181b', color: 'white', fontFamily: '"Press Start 2P", cursive', fontSize: '0.8em' }}
        />
        <button 
          onClick={handleUsernameSubmit} 
          style={{ ...navButtonStyle('login'), width: '100%', marginTop: '20px', justifyContent: 'center' }}>
          Entrar
        </button>
      </div>
    </div>
  );

  const mainApp = (
    <>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem' }}>
        <p>Bem-vindo, {username}!</p>
        <TonConnectButton />
      </header>
      <div style={{ textAlign: 'center', padding: '10px', minHeight: '40px', color: status.startsWith('❌') ? '#f87171' : '#34d399' }}>
        <p>{status}</p>
      </div>
      {renderPage()}
      <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'center', padding: '1rem', background: '#2d3748', flexWrap: 'wrap' }}>
        <button onClick={() => setRoute('mine')} style={navButtonStyle('mine')}>⛏️ Minerar</button>
        <button onClick={() => setRoute('shop')} style={navButtonStyle('shop')}>🛒 Loja</button>
        <button onClick={() => setRoute('games')} style={navButtonStyle('games')}>🎮 Jogos</button>
        <button onClick={() => setRoute('user')} style={navButtonStyle('user')}>👤 Perfil</button>
        <button onClick={() => setRoute('rankings')} style={navButtonStyle('rankings')}>🏆 Rankings</button>
      </nav>
    </>
  );

  return (
    <div style={{ background: '#18181b', color: '#f4f4f5', minHeight: '100vh', paddingBottom: '100px' }}>
      {!username ? loginScreen : mainApp}
    </div>
  );
}

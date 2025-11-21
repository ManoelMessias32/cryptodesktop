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
  }, []);

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
      setEnergyEarnedInSession(0); // Reseta para a próxima sessão (se houver)
      setStatus('Você completou uma sessão de 1 hora de ganhos!');
    }
  }, [dailySessionsUsed, energyEarnedInSession]);

  const gameLoop = useCallback(() => {
    // ... (lógica do gameLoop existente)
  }, [slots, paidBoostTime]);

  useEffect(() => {
    const gameInterval = setInterval(gameLoop, 1000);
    return () => clearInterval(gameInterval);
  }, [gameLoop]);


  const renderPage = () => {
    switch (route) {
      case 'games':
        return <GamesPage onGameWin={handleGameWin} />;
      // ... (outros casos)
      default:
        return <MiningPage coinBdg={coinBdg} setCoinBdg={setCoinBdg} slots={slots} setSlots={setSlots} status={status} setStatus={setStatus} addNewSlot={() => {}} paidBoostTime={paidBoostTime} setPaidBoostTime={setPaidBoostTime} economyData={economyData} />;
    }
  };

  // ... (JSX para login e layout principal)
  return <div>{renderPage()}</div>; // Exemplo simplificado
}

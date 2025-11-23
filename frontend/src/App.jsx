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

// Shop constants
const SHOP_RECEIVER_ADDRESS = 'UQAcxItDorzIiYeZNuC51XlqCYDuP3vnDvVu18iFJhK1cFOx';
const TIER_PRICES = { 1: '3500000000', 2: '9000000000', 3: '17000000000' }; // Prices in nanotons

const STORAGE_VERSION = 'v15'; // <<-- VERSÃO ATUALIZADA

export default function App() {
  const [route, setRoute] = useState('mine');
  const [status, setStatus] = useState('Bem-vindo! Conecte sua carteira quando quiser.');
  const [coinBdg, setCoinBdg] = useState(() => Number(localStorage.getItem(`cryptoDesktopMined_${STORAGE_VERSION}`)) || 0);
  const [slots, setSlots] = useState(() => {
    try {
      const savedSlots = localStorage.getItem(`cryptoDesktopSlots_${STORAGE_VERSION}`);
      return savedSlots ? JSON.parse(savedSlots) : initialSlots;
    } catch (e) { return initialSlots; }
  });
  const [username, setUsername] = useState(() => localStorage.getItem('cryptoDesktopUsername') || '');
  const [tempUsername, setTempUsername] = useState('');
  const [paidBoostTime, setPaidBoostTime] = useState(() => Number(localStorage.getItem(`paidBoostTime_${STORAGE_VERSION}`)) || 0);

  // Game energy state
  const [energyEarnedInSession, setEnergyEarnedInSession] = useState(() => Number(localStorage.getItem(`energyEarnedInSession_${STORAGE_VERSION}`)) || 0);
  const [dailySessionsUsed, setDailySessionsUsed] = useState(() => Number(localStorage.getItem(`dailySessionsUsed_${STORAGE_VERSION}`)) || 0);
  const [lastSessionReset, setLastSessionReset] = useState(() => localStorage.getItem(`lastSessionReset_${STORAGE_VERSION}`) || new Date().toISOString().split('T')[0]);

  const userFriendlyAddress = useTonAddress();
  const [tonConnectUI] = useTonConnectUI();

  // Save state to localStorage
  useEffect(() => { localStorage.setItem(`cryptoDesktopSlots_${STORAGE_VERSION}`, JSON.stringify(slots)); }, [slots]);
  useEffect(() => { localStorage.setItem(`cryptoDesktopMined_${STORAGE_VERSION}`, coinBdg); }, [coinBdg]);
  useEffect(() => { localStorage.setItem('cryptoDesktopUsername', username); }, [username]);
  useEffect(() => { localStorage.setItem(`paidBoostTime_${STORAGE_VERSION}`, paidBoostTime); }, [paidBoostTime]);
  useEffect(() => { localStorage.setItem(`energyEarnedInSession_${STORAGE_VERSION}`, energyEarnedInSession); }, [energyEarnedInSession]);
  useEffect(() => { localStorage.setItem(`dailySessionsUsed_${STORAGE_VERSION}`, dailySessionsUsed); }, [dailySessionsUsed]);
  useEffect(() => { localStorage.setItem(`lastSessionReset_${STORAGE_VERSION}`, lastSessionReset); }, [lastSessionReset]);

  // Reset daily sessions
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    if (lastSessionReset !== today) {
      setDailySessionsUsed(0);
      setEnergyEarnedInSession(0);
      setLastSessionReset(today);
      setStatus('Suas sessões de energia de jogo foram resetadas!');
    }
  }, [lastSessionReset]);

  const handleUsernameSubmit = () => { if (tempUsername.trim()) setUsername(tempUsername.trim()); };

  const addNewSlot = () => {
    if (slots.length >= 6) {
        setStatus('❌ Limite de 6 gabinetes atingido!');
        return;
    }
    if (coinBdg >= NEW_SLOT_COST) {
        setCoinBdg(prev => prev - NEW_SLOT_COST);
        setSlots(prev => [...prev, { name: `Slot ${prev.length + 1}`, filled: false, free: false, repairCooldown: 0 }]);
        setStatus(`✅ Gabinete ${slots.length + 1} comprado com sucesso!`)
    } else {
        setStatus(`❌ BDG insuficiente! Você precisa de ${NEW_SLOT_COST} BDG.`)
    }
  };

  const handlePurchase = async (tierToBuy) => {
    if (!userFriendlyAddress) {
        setStatus('❌ Por favor, conecte sua carteira para comprar.');
        return;
    }
    const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 60,
        messages: [
            {
                address: SHOP_RECEIVER_ADDRESS,
                amount: TIER_PRICES[tierToBuy]
            }
        ]
    };
    try {
        setStatus('⏳ Enviando transação para sua carteira...');
        await tonConnectUI.sendTransaction(transaction);
        setStatus('✅ Transação enviada! Aguardando confirmação da compra.');
        const emptySlotIndex = slots.findIndex(slot => !slot.filled);
        if (emptySlotIndex !== -1) {
            setSlots(prevSlots => prevSlots.map((slot, index) => {
                if (index === emptySlotIndex) {
                    return { ...slot, filled: true, type: 'paid', tier: tierToBuy, repairCooldown: TWENTY_FOUR_HOURS_IN_SECONDS };
                }
                return slot;
            }));
            setStatus(`🎉 CPU Padrão Tier ${tierToBuy} comprado e montado com sucesso!`);
        } else {
            setStatus('✅ Compra aprovada, mas você não tem gabinetes vazios para instalar a CPU.');
        }
    } catch (error) {
        console.error(error);
        setStatus('❌ Transação cancelada ou falhou.');
    }
  };

  const handleGameWin = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    if (lastSessionReset !== today) {
        setDailySessionsUsed(0);
        setEnergyEarnedInSession(0);
        setLastSessionReset(today);
    }

    if (dailySessionsUsed >= 3) {
      setStatus('❌ Você já usou suas 3 sessões de energia de hoje.');
      return;
    }
    if (energyEarnedInSession >= 60) {
      setStatus('🕒 Limite de 1h de energia atingido nesta sessão. Use outra sessão mais tarde!');
      if(dailySessionsUsed < 3 && energyEarnedInSession >= 60) {
          setDailySessionsUsed(prev => prev + 1);
          setEnergyEarnedInSession(0);
      }
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
    setStatus(`🎉 Você ganhou 10 minutos de energia! Total na sessão: ${newEnergyEarned} min.`);

    if (newEnergyEarned >= 60) {
        setDailySessionsUsed(prev => prev + 1);
        setEnergyEarnedInSession(0);
        setStatus('✨ Sessão de energia completa! Use as próximas mais tarde.');
    }

  }, [dailySessionsUsed, energyEarnedInSession, lastSessionReset]);

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

  const navButtonStyle = (page) => ({
    background: route === page ? '#5a67d8' : '#4a5568',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1, // Faz com que todos os botões tenham o mesmo tamanho
    padding: '10px 0', // Ajusta o preenchimento vertical
    margin: '0 4px',   // Espaçamento horizontal
    fontSize: '1.5em', // Aumenta o tamanho do ícone
    maxWidth: '60px', // Limita a largura máxima
  });

  const renderPage = () => {
    switch (route) {
      case 'mine':
        return <MiningPage coinBdg={coinBdg} setCoinBdg={setCoinBdg} slots={slots} setSlots={setSlots} status={status} setStatus={setStatus} addNewSlot={addNewSlot} paidBoostTime={paidBoostTime} setPaidBoostTime={setPaidBoostTime} economyData={economyData} />;
      case 'shop':
        return <ShopPage handlePurchase={handlePurchase} />;
      case 'games':
        return <GamesPage onGameWin={handleGameWin} />;
      case 'user':
        return <UserPage address={userFriendlyAddress} coinBdg={coinBdg} username={username} />;
      case 'rankings':
        return <RankingsPage />;
      default:
        return <MiningPage coinBdg={coinBdg} setCoinBdg={setCoinBdg} slots={slots} setSlots={setSlots} status={status} setStatus={setStatus} addNewSlot={addNewSlot} paidBoostTime={paidBoostTime} setPaidBoostTime={setPaidBoostTime} economyData={economyData} />;
    }
  };

  const loginScreen = (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', padding: '20px' }}>
       {/* ... (seu código da tela de login) */}
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
      <nav style={{ 
          position: 'fixed', 
          bottom: 0, 
          left: 0, 
          right: 0, 
          display: 'flex', 
          justifyContent: 'space-around', // Distribui o espaço igualmente
          padding: '0.5rem', 
          background: '#2d3748', 
          gap: '5px' // Pequeno espaço entre os botões
      }}>
        <button onClick={() => setRoute('mine')} style={navButtonStyle('mine')} title="Minerar">⛏️</button>
        <button onClick={() => setRoute('shop')} style={navButtonStyle('shop')} title="Loja">🛒</button>
        <button onClick={() => setRoute('games')} style={navButtonStyle('games')} title="Jogos">🎮</button>
        <button onClick={() => setRoute('user')} style={navButtonStyle('user')} title="Perfil">👤</button>
        <button onClick={() => setRoute('rankings')} style={navButtonStyle('rankings')} title="Rankings">🏆</button>
      </nav>
    </>
  );

  return (
    <div style={{ background: '#18181b', color: '#f4f4f5', minHeight: '100vh', paddingBottom: '100px' }}>
      {!username ? loginScreen : mainApp}
    </div>
  );
}

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

  // Game energy state
  const [energyEarnedInSession, setEnergyEarnedInSession] = useState(() => Number(localStorage.getItem('energyEarnedInSession_v14')) || 0);
  const [dailySessionsUsed, setDailySessionsUsed] = useState(() => Number(localStorage.getItem('dailySessionsUsed_v14')) || 0);
  const [lastSessionReset, setLastSessionReset] = useState(() => localStorage.getItem('lastSessionReset_v14') || new Date().toISOString().split('T')[0]);

  const userFriendlyAddress = useTonAddress();
  const [tonConnectUI] = useTonConnectUI();

  // Save state to localStorage
  useEffect(() => { localStorage.setItem('cryptoDesktopSlots_v14', JSON.stringify(slots)); }, [slots]);
  useEffect(() => { localStorage.setItem('cryptoDesktopMined_v14', coinBdg); }, [coinBdg]);
  useEffect(() => { localStorage.setItem('cryptoDesktopUsername', username); }, [username]);
  useEffect(() => { localStorage.setItem('paidBoostTime_v14', paidBoostTime); }, [paidBoostTime]);
  useEffect(() => { localStorage.setItem('energyEarnedInSession_v14', energyEarnedInSession); }, [energyEarnedInSession]);
  useEffect(() => { localStorage.setItem('dailySessionsUsed_v14', dailySessionsUsed); }, [dailySessionsUsed]);
  useEffect(() => { localStorage.setItem('lastSessionReset_v14', lastSessionReset); }, [lastSessionReset]);

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

  // --- LÓGICA DE COMPRA DE GABINETE ---
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

  // --- LÓGICA DE COMPRA DA LOJA (TON) ---
  const handlePurchase = async (tierToBuy) => {
    if (!userFriendlyAddress) {
        setStatus('❌ Por favor, conecte sua carteira para comprar.');
        return;
    }

    const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 60, // 1 minute from now
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

        // Aqui você adicionaria o item comprado ao inventário do usuário.
        // Por exemplo, encontrar um slot vazio e preenchê-lo com o novo tier.
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
    // ... (lógica de energia dos jogos)
  }, [dailySessionsUsed, energyEarnedInSession, lastSessionReset]);

  const gameLoop = useCallback(() => {
    // ... (lógica de mineração)
  }, [paidBoostTime]);

  useEffect(() => {
    const gameInterval = setInterval(gameLoop, 1000);
    return () => clearInterval(gameInterval);
  }, [gameLoop]);

  // --- Renderização ---
  const navButtonStyle = (page) => ({ padding: '10px 15px', margin: '0 5px', border: 'none', borderRadius: '5px', cursor: 'pointer', backgroundColor: route === page ? '#5a67d8' : '#4a5568', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: '"Press Start 2P", cursive', fontSize: '0.7em', flexWrap: 'wrap' });

  const renderPage = () => {
    switch (route) {
      case 'mine':
        return <MiningPage coinBdg={coinBdg} setCoinBdg={setCoinBdg} slots={slots} setSlots={setSlots} status={status} setStatus={setStatus} addNewSlot={addNewSlot} paidBoostTime={paidBoostTime} setPaidBoostTime={setPaidBoostTime} economyData={economyData} />;
      case 'shop':
        return <ShopPage handlePurchase={handlePurchase} />;
      case 'games':
        return <GamesPage onGameWin={handleGameWin} />;
      case 'user':
        return <UserPage address={userFriendlyAddress} coinBdg={0} username={username} />;
      case 'rankings':
        return <RankingsPage />;
      default:
        return <MiningPage coinBdg={coinBdg} setCoinBdg={setCoinBdg} slots={slots} setSlots={setSlots} status={status} setStatus={setStatus} addNewSlot={addNewSlot} paidBoostTime={paidBoostTime} setPaidBoostTime={setPaidBoostTime} economyData={economyData} />;
    }
  };

  // ... (JSX para login e layout principal)
  const loginScreen = (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', padding: '20px' }}>
       {/* ... */}
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

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { TonConnectButton, useTonAddress, useTonConnectUI } from '@tonconnect/ui-react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
// CORREÇÃO: Importação do conector atualizada para a sintaxe moderna da Wagmi
import { injected } from 'wagmi/connectors';
import MiningPage from './MiningPage';
import ShopPage from './ShopPage';
import UserPage from './UserPage';
import RankingsPage from './RankingsPage';
import GamesPage from './GamesPage';
import { economyData } from './economy';

// --- Constantes & Configurações ---
const ONE_HOUR_IN_SECONDS = 3600;
const SEVEN_DAYS_IN_SECONDS = 7 * 24 * 3600;
const initialSlots = [{ name: 'Slot 1', filled: true, free: true, type: 'free', tier: 1, repairCooldown: ONE_HOUR_IN_SECONDS, durability: SEVEN_DAYS_IN_SECONDS }];
const NEW_SLOT_COST = 500;
const STORAGE_VERSION = 'v32_web_separation'; // Versão atualizada

export default function App() {
  // --- State Hooks ---
  const [route, setRoute] = useState('mine');
  const [status, setStatus] = useState('Bem-vindo!');
  const [coinBdg, setCoinBdg] = useState(0);
  const [claimableBdg, setClaimableBdg] = useState(0);
  const [slots, setSlots] = useState([]);
  const [username, setUsername] = useState('');
  const [tempUsername, setTempUsername] = useState('');
  const [paidBoostTime, setPaidBoostTime] = useState(0);
  const [gamesPlayedToday, setGamesPlayedToday] = useState(0);
  const [lastGamePlayedDate, setLastGamePlayedDate] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);

  // --- Hooks de Ambiente e Conexão ---
  const isTelegram = useMemo(() => typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp, []);
  
  // Hooks da TON (só usados se isTelegram for true)
  const tonAddress = useTonAddress();
  const [tonConnectUI] = useTonConnectUI();

  // Hooks da BNB (Wagmi)
  const { address: bnbAddress, isConnected: isBnbConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect: disconnectBnb } = useDisconnect();

  // --- Lógica de Carregamento e Salvamento de Dados (localStorage) ---
  const saveData = useCallback(() => {
    if (!isInitialized || !username) return;
    const gameState = { slots, coinBdg, claimableBdg, username, paidBoostTime, gamesPlayedToday, lastGamePlayedDate, lastSaveTimestamp: Date.now() };
    localStorage.setItem(`gameState_${STORAGE_VERSION}_${username}`, JSON.stringify(gameState));
  }, [isInitialized, username, slots, coinBdg, claimableBdg, paidBoostTime, gamesPlayedToday, lastGamePlayedDate]);

  useEffect(() => {
    if (isTelegram && window.Telegram.WebApp) {
      window.Telegram.WebApp.ready();
    }
  }, [isTelegram]);

    const handleUsernameSubmit = () => {
    const newUsername = tempUsername.trim();
    if (newUsername) {
      const savedStateJSON = localStorage.getItem(`gameState_${STORAGE_VERSION}_${newUsername}`);
      if (savedStateJSON) {
        const savedState = JSON.parse(savedStateJSON);
        setSlots(savedState.slots || initialSlots);
        setCoinBdg(savedState.coinBdg || 0);
        setClaimableBdg(savedState.claimableBdg || 0);
        setUsername(savedState.username);
        setPaidBoostTime(savedState.paidBoostTime || 0);
        const today = new Date().toISOString().split('T')[0];
        if (savedState.lastGamePlayedDate !== today) {
            setGamesPlayedToday(0);
            setLastGamePlayedDate(today);
        } else {
            setGamesPlayedToday(savedState.gamesPlayedToday || 0);
            setLastGamePlayedDate(savedState.lastGamePlayedDate);
        }
      } else {
        setSlots(initialSlots);
        setCoinBdg(0);
        setClaimableBdg(0);
        setGamesPlayedToday(0);
        setLastGamePlayedDate(new Date().toISOString().split('T')[0]);
      }
      setUsername(newUsername);
      setIsInitialized(true);
    }
  };


  // ... (gameLoop, etc. permanecem os mesmos)
  const gameLoop = useCallback(() => {
    if (!isInitialized || !username) return;
    let totalGain = 0;
    setSlots(currentSlots => {
        const updatedSlots = currentSlots.map(slot => {
            if (slot.filled && slot.repairCooldown > 0 && slot.durability > 0) {
                const econKey = slot.type === 'free' ? 'free' : (slot.type === 'special' ? slot.tier.toString().toUpperCase() : slot.tier);
                let gainRate = (economyData[econKey]?.gainPerHour || 0) / 3600;
                if (paidBoostTime > 0) gainRate *= 1.5;
                totalGain += gainRate;
                return { ...slot, repairCooldown: slot.repairCooldown - 1, durability: slot.durability - 1 };
            }
            return slot;
        });
        if (totalGain > 0) {
            setCoinBdg(prev => prev + totalGain);
            setClaimableBdg(prev => prev + totalGain);
        }
        return updatedSlots;
    });
    if (paidBoostTime > 0) setPaidBoostTime(prev => prev - 1);
  }, [isInitialized, username, paidBoostTime]);

  useEffect(() => {
    const gameInterval = setInterval(gameLoop, 1000);
    return () => clearInterval(gameInterval);
  }, [gameLoop]);

  // --- Componentes de UI ---

  const ConnectButton = () => {
    if (isTelegram) {
      return <TonConnectButton />;
    } else {
      return isBnbConnected ? 
        <button onClick={() => disconnectBnb()}>{`${bnbAddress.substring(0, 6)}...${bnbAddress.substring(bnbAddress.length - 4)}`}</button> :
        // CORREÇÃO: Passando o conector injetado (MetaMask) para a função connect
        <button onClick={() => connect({ connector: injected() })}>Conectar Carteira BNB</button>;
    }
  };

  const navButtonStyle = (page) => ({ background: route === page ? '#5a67d8' : '#4a5568', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '10px 0', margin: '0 4px', fontSize: '1.5em', maxWidth: '60px' });

  const mainApp = (
    <>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem' }}>
        <p>Bem-vindo, {username}!</p>
        <ConnectButton />
      </header>
      <div style={{ textAlign: 'center', padding: '10px', minHeight: '40px' }}><p>{status}</p></div>
      
      {(() => {
        switch (route) {
          case 'mine': return <MiningPage coinBdg={coinBdg} slots={slots} setSlots={setSlots} status={status} setStatus={setStatus} addNewSlot={()=>{}} handleBuyEnergyForAll={()=>{}} handleRepairCpu={()=>{}} economyData={economyData} paidBoostTime={paidBoostTime} />;
          case 'shop': return <ShopPage />; // ShopPage agora lida com sua própria lógica de compra
          case 'games': return !isTelegram ? <GamesPage /> : null;
          case 'user': return isTelegram ? <UserPage address={tonAddress} coinBdg={coinBdg} claimableBdg={claimableBdg} username={username} /> : null;
          case 'rankings': return <RankingsPage />;
          default: return <MiningPage coinBdg={coinBdg} slots={slots} setSlots={setSlots} status={status} setStatus={setStatus} addNewSlot={()=>{}} handleBuyEnergyForAll={()=>{}} handleRepairCpu={()=>{}} economyData={economyData} paidBoostTime={paidBoostTime} />;
        }
      })()}

      <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', padding: '0.5rem', background: '#2d3748', gap: '5px' }}>
        <button onClick={() => setRoute('mine')} style={navButtonStyle('mine')} title="Minerar">⛏️</button>
        {isTelegram ? (
          <>
            <button onClick={() => setRoute('shop')} style={navButtonStyle('shop')} title="Loja">🛒</button>
            <button onClick={() => setRoute('user')} style={navButtonStyle('user')} title="Perfil">👤</button>
          </>
        ) : (
          <>
            <button onClick={() => setRoute('shop')} style={navButtonStyle('shop')} title="Loja">🛒</button>
            <button onClick={() => setRoute('games')} style={navButtonStyle('games')} title="Jogos">🎮</button>
          </>
        )}
        <button onClick={() => setRoute('rankings')} style={navButtonStyle('rankings')} title="Rankings">🏆</button>
      </nav>
    </>
  );

  const loginScreen = (
     <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', padding: '20px', background: '#18181b', color: '#f4f4f5' }}>
      <h1 style={{ fontFamily: '"Press Start 2P", cursive', color: '#facc15' }}>CryptoDesk</h1>
      <p style={{ marginBottom: '30px' }}>Digite seu nome de usuário para começar</p>
      <input type="text" value={tempUsername} onChange={(e) => setTempUsername(e.target.value)} placeholder="Seu nome aqui" style={{ padding: '10px', borderRadius: '5px', border: '1px solid #4a5568', background: '#2d3748', color: 'white', marginBottom: '20px', width: '90%', maxWidth: '350px' }} />
      <button onClick={handleUsernameSubmit} style={{ padding: '10px 20px', borderRadius: '5px', border: 'none', background: '#6366f1', color: 'white', cursor: 'pointer', fontFamily: '"Press Start 2P", cursive' }}>Entrar</button>
    </div>
  );

  return (
    <div style={{ background: '#18181b', color: '#f4f4f5', minHeight: '100vh', paddingBottom: '100px' }}>
      {!username ? loginScreen : mainApp}
    </div>
  );
}

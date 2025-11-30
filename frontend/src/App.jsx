import React, { useState, useEffect, useCallback, useMemo } from 'react';

// Hooks e componentes de bibliotecas externas
import { TonConnectButton, useTonAddress } from '@tonconnect/ui-react';
import { useAccount, useConnect, useDisconnect, useSendTransaction } from 'wagmi';
import { parseEther } from 'viem';
import { injected } from 'wagmi/connectors';

// Páginas e dados do aplicativo
import MiningPage from './MiningPage';
import ShopPage from './ShopPage';
import UserPage from './UserPage';
import RankingsPage from './RankingsPage';
import GamesPage from './GamesPage';
import PreSalePage from './PreSalePage'; // Importa a nova página
import { economyData } from './economy';

// --- Constantes ---
const STORAGE_VERSION = 'v42_unified_app'; 
const ONE_HOUR_IN_SECONDS = 3600;
const SEVEN_DAYS_IN_SECONDS = 7 * 24 * 3600;
const initialSlots = [{ name: 'Slot 1', filled: true, free: true, type: 'free', tier: 0, repairCooldown: ONE_HOUR_IN_SECONDS, durability: SEVEN_DAYS_IN_SECONDS }];
const YOUR_WALLET_ADDRESS = "0x35878269ef4051df5f82593b4819e518ba8903a3"; // SEU ENDEREÇO DE CARTEIRA

// ===================================================================================
// COMPONENTES DE CONTEÚDO ESPECÍFICO (para separar os hooks)
// ===================================================================================

function TonAppContent({ appProps }) {
  const tonAddress = useTonAddress();
  return <MainApp {...appProps} isTelegram={true} tonAddress={tonAddress} />;
}

function WebAppContent({ appProps }) {
  const { address: bnbAddress, isConnected: isBnbConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect: disconnectBnb } = useDisconnect();
  const { sendTransaction } = useSendTransaction();

  return <MainApp {...appProps} isTelegram={false} bnbAddress={bnbAddress} isBnbConnected={isBnbConnected} connect={connect} disconnectBnb={disconnectBnb} sendTransaction={sendTransaction} />;
}


// ===================================================================================
// COMPONENTE PRINCIPAL UNIFICADO
// ===================================================================================
export default function App() {
  // --- Estados Globais ---
  const [username, setUsername] = useState(() => localStorage.getItem('last_username') || '');
  const [tempUsername, setTempUsername] = useState('');
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [route, setRoute] = useState('mine');
  const [status, setStatus] = useState('Bem-vindo!');
  const [slots, setSlots] = useState(initialSlots);
  const [coinBdg, setCoinBdg] = useState(0);
  const [claimableBdg, setClaimableBdg] = useState(0);
  const [gamesPlayedToday, setGamesPlayedToday] = useState(0);
  const [lastGamePlayedDate, setLastGamePlayedDate] = useState(new Date().toISOString().split('T')[0]);

  const isTelegram = useMemo(() => typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp, []);

  // --- LÓGICA DE DADOS E MINERAÇÃO (UNIFICADA) ---

  useEffect(() => {
    if (username) {
      const savedState = localStorage.getItem(`gameState_${STORAGE_VERSION}_${username}`);
      let newCoinBdg = 0;
      let newClaimableBdg = 0;
      let newSlots = initialSlots;
      const today = new Date().toISOString().split('T')[0];

      if (savedState) {
        const data = JSON.parse(savedState);
        newCoinBdg = data.coinBdg || 0;
        newClaimableBdg = data.claimableBdg || 0;
        newSlots = data.slots || initialSlots;
        setGamesPlayedToday(data.lastGamePlayedDate !== today ? 0 : data.gamesPlayedToday || 0);
        setLastGamePlayedDate(data.lastGamePlayedDate !== today ? today : data.lastGamePlayedDate);

        const now = Date.now();
        const lastSave = data.lastSaveTimestamp || now;
        const offlineSeconds = Math.floor((now - lastSave) / 1000);

        if (offlineSeconds > 1) {
          let accumulatedGain = 0;
          newSlots = newSlots.map(slot => {
            if (slot.filled && slot.repairCooldown > 0 && slot.durability > 0) {
              const secondsToMine = Math.min(slot.repairCooldown, slot.durability, offlineSeconds);
              const econKey = slot.type === 'free' ? 'free' : slot.tier;
              const gainRatePerSecond = (economyData[econKey]?.gainPerHour || 0) / 3600;
              accumulatedGain += gainRatePerSecond * secondsToMine;
              return { ...slot, repairCooldown: Math.max(0, slot.repairCooldown - offlineSeconds), durability: Math.max(0, slot.durability - offlineSeconds) };
            }
            return slot;
          });
          newCoinBdg += accumulatedGain;
          newClaimableBdg += accumulatedGain;
        }
      }
      
      setSlots(newSlots);
      setCoinBdg(newCoinBdg);
      setClaimableBdg(newClaimableBdg);
      setIsDataLoaded(true);
    }
  }, [username]);

  useEffect(() => {
    if (isDataLoaded) {
      const gameState = { slots, coinBdg, claimableBdg, gamesPlayedToday, lastGamePlayedDate, lastSaveTimestamp: Date.now() };
      localStorage.setItem(`gameState_${STORAGE_VERSION}_${username}`, JSON.stringify(gameState));
    }
  }, [slots, coinBdg, claimableBdg, gamesPlayedToday, lastGamePlayedDate, isDataLoaded, username]);

  useEffect(() => {
    if (!isDataLoaded) return;
    const gameLoop = setInterval(() => {
      let totalGain = 0;

      const updatedSlots = slots.map(slot => {
        if (slot.filled && slot.repairCooldown > 0 && slot.durability > 0) {
          const econKey = slot.type === 'free' ? 'free' : slot.tier;
          const gainRate = (economyData[econKey]?.gainPerHour || 0) / 3600;
          totalGain += gainRate;
          return { ...slot, repairCooldown: slot.repairCooldown - 1, durability: slot.durability - 1 };
        }
        return slot;
      });

      setSlots(updatedSlots);

      if (totalGain > 0) {
        setCoinBdg(prev => prev + totalGain);
        setClaimableBdg(prev => prev + totalGain);
      }
    }, 1000);

    return () => clearInterval(gameLoop);
  }, [isDataLoaded, slots]);


  const handleGameWin = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    let currentGamesPlayed = lastGamePlayedDate === today ? gamesPlayedToday : 0;
    if (currentGamesPlayed < 9) {
      setCoinBdg(prev => prev + 5);
      setGamesPlayedToday(currentGamesPlayed + 1);
      setLastGamePlayedDate(today);
      setStatus(`Recompensa: +5 Token Coin! (${currentGamesPlayed + 1}/9)`);
    } else {
      setStatus("Limite de recompensas diárias atingido.");
    }
  }, [gamesPlayedToday, lastGamePlayedDate]);

  const handleBuyEnergyForAll = () => {
    const cost = 10 * slots.length;
    if (coinBdg >= cost) {
      setCoinBdg(prev => prev - cost);
      setSlots(slots.map(slot => ({ ...slot, repairCooldown: ONE_HOUR_IN_SECONDS })));
      setStatus("Energia de todos os slots foi reabastecida!");
    } else {
      setStatus("Token Coins insuficientes para reabastecer a energia.");
    }
  };

  const handleUsernameSubmit = () => {
    const newUsername = tempUsername.trim();
    if (newUsername) {
      localStorage.setItem('last_username', newUsername);
      setUsername(newUsername);
      setIsDataLoaded(false);
    }
  };

  // --- RENDERIZAÇÃO ---

  if (!username) {
    return <LoginScreen tempUsername={tempUsername} setTempUsername={setTempUsername} handleUsernameSubmit={handleUsernameSubmit} />;
  }

  if (!isDataLoaded) {
    return <div style={{display: 'flex', justifyContent:'center', alignItems:'center', height:'100vh', background:'#18181b', color:'#facc15'}}>Carregando seus dados...</div>;
  }
  
  const appProps = { username, slots, setSlots, coinBdg, setCoinBdg, claimableBdg, setRoute, route, status, setStatus, handleGameWin, handleBuyEnergyForAll };

  return isTelegram ? <TonAppContent appProps={appProps} /> : <WebAppContent appProps={appProps} />;
}


// --- Componente da Aplicação Principal ---
function MainApp({ username, slots, setSlots, coinBdg, setCoinBdg, claimableBdg, isTelegram, tonAddress, bnbAddress, isBnbConnected, connect, disconnectBnb, setRoute, route, status, setStatus, handleGameWin, handleBuyEnergyForAll, sendTransaction }) {

  const handleBuyBdg = (price) => {
    if (!isBnbConnected) {
      setStatus("Por favor, conecte sua carteira BNB primeiro.");
      return;
    }
    sendTransaction({ to: YOUR_WALLET_ADDRESS, value: parseEther(String(price)) });
  };

  const navButtonStyle = (page) => ({
    background: route === page ? '#0056b3' : '#007BFF',
    color: 'white', 
    border: 'none', 
    borderRadius: '10px', 
    cursor: 'pointer', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    flex: 1, 
    padding: '10px 0', 
    margin: '0 4px', 
    fontSize: '1.5em', 
    maxWidth: '60px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
    transition: 'background-color 0.3s ease',
  });

  const ConnectButton = () => (
    isTelegram ? <TonConnectButton /> : (
      isBnbConnected ?
        <button onClick={() => disconnectBnb()} style={{padding: '10px', borderRadius: '5px', border: 'none', background: '#4a5568', color: 'white'}}>{`${bnbAddress.substring(0, 6)}...${bnbAddress.substring(bnbAddress.length - 4)}`}</button> :
        <button onClick={() => connect({ connector: injected() })} style={{padding: '10px 20px', borderRadius: '5px', border: 'none', background: '#007BFF', color: 'white'}}>Conectar Carteira</button>
    )
  );

  return (
    <>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', color: '#f4f4f5', background: '#1a1a1a' }}>
        <p>Bem-vindo, {username}!</p>
        <ConnectButton />
      </header>
      <div style={{ textAlign: 'center', padding: '10px', minHeight: '40px', color: '#d4d4d8', background: '#1a1a1a' }}><p>{status}</p></div>
      
      {route === 'mine' && <MiningPage coinBdg={coinBdg} setCoinBdg={setCoinBdg} slots={slots} setSlots={setSlots} setStatus={setStatus} economyData={economyData} handleBuyEnergyForAll={handleBuyEnergyForAll} setRoute={setRoute} />}
      {route === 'shop' && <ShopPage />}
      {route === 'presale' && <PreSalePage handleBuyBdg={handleBuyBdg} />}
      {route === 'rankings' && <RankingsPage />}
      {route === 'user' && (isTelegram ? <UserPage address={tonAddress} coinBdg={coinBdg} claimableBdg={claimableBdg} username={username} /> : <UserPage username={username} coinBdg={coinBdg} claimableBdg={claimableBdg} />)}
      {route === 'games' && <GamesPage onGameWin={handleGameWin} />}
      
      <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', padding: '0.5rem', background: '#2d3748', gap: '5px' }}>
        <button onClick={() => setRoute('mine')} style={navButtonStyle('mine')} title="Minerar">⛏️</button>
        <button onClick={() => setRoute('shop')} style={navButtonStyle('shop')} title="Loja">🛒</button>
        {!isTelegram && <button onClick={() => setRoute('games')} style={navButtonStyle('games')} title="Jogos">🎮</button>}
        <button onClick={() => setRoute('presale')} style={navButtonStyle('presale')} title="Pré-Venda">💲</button>
        <button onClick={() => setRoute('user')} style={navButtonStyle('user')} title="Perfil">👤</button>
        <button onClick={() => setRoute('rankings')} style={navButtonStyle('rankings')} title="Rankings">🏆</button>
      </nav>
    </>
  );
}

// --- Componente da Tela de Login (sem alterações) ---
function LoginScreen({ tempUsername, setTempUsername, handleUsernameSubmit }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', padding: '20px', background: '#18181b', color: '#f4f4f5' }}>
      <h1 style={{ fontFamily: '"Press Start 2P", cursive', color: '#facc15' }}>CryptoDesk</h1>
      <p style={{ marginBottom: '30px' }}>Digite seu nome de usuário para começar</p>
      <input type="text" value={tempUsername} onChange={(e) => setTempUsername(e.target.value)} placeholder="Seu nome aqui" style={{ padding: '10px', borderRadius: '5px', border: '1px solid #4a5568', background: '#2d3748', color: 'white', marginBottom: '20px', width: '90%', maxWidth: '350px' }} />
      <button onClick={handleUsernameSubmit} style={{ padding: '10px 20px', borderRadius: '5px', border: 'none', background: '#007BFF', color: 'white', cursor: 'pointer', fontFamily: '"Press Start 2P", cursive' }}>Entrar</button>
    </div>
  );
}

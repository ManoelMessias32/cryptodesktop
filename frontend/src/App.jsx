import React, { useState, useEffect, useCallback, useMemo } from 'react';

// Hooks e componentes de bibliotecas externas
import { TonConnectButton, useTonAddress, useTonConnectUI } from '@tonconnect/ui-react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';

// Páginas e dados do aplicativo
import MiningPage from './MiningPage';
import ShopPage from './ShopPage';
import UserPage from './UserPage';
import RankingsPage from './RankingsPage';
import GamesPage from './GamesPage';
import { economyData } from './economy';

// --- Constantes ---
const STORAGE_VERSION = 'v33_final_split';
const ONE_HOUR_IN_SECONDS = 3600;
const SEVEN_DAYS_IN_SECONDS = 7 * 24 * 3600;
const initialSlots = [{ name: 'Slot 1', filled: true, free: true, type: 'free', tier: 1, repairCooldown: ONE_HOUR_IN_SECONDS, durability: SEVEN_DAYS_IN_SECONDS }];

// ===================================================================================
// COMPONENTE PARA O FLUXO DO TELEGRAM (TON)
// ===================================================================================
function TelegramFlow({ username }) {
  const [route, setRoute] = useState('mine');
  const [status, setStatus] = useState('Bem-vindo ao CryptoDesk!');
  const [coinBdg, setCoinBdg] = useState(0);
  const [slots, setSlots] = useState(initialSlots);
  const [claimableBdg, setClaimableBdg] = useState(0); // Adicionado para consistência
  
  const tonAddress = useTonAddress();
  const [tonConnectUI] = useTonConnectUI();

  const handlePurchase = async (tierToBuy) => { /* ... sua lógica de compra com tonConnectUI ... */ };
  const handleBuyBdgCoin = async () => { /* ... sua lógica de compra de moeda com tonConnectUI ... */ };

  useEffect(() => {
    const savedState = localStorage.getItem(`gameState_${STORAGE_VERSION}_${username}`);
    if (savedState) {
      const data = JSON.parse(savedState);
      setSlots(data.slots || initialSlots);
      setCoinBdg(data.coinBdg || 0);
      setClaimableBdg(data.claimableBdg || 0);
    }
    if (window.Telegram && window.Telegram.WebApp) {
      window.Telegram.WebApp.ready();
    }
  }, [username]);

  const saveData = useCallback(() => {
    const gameState = { slots, coinBdg, claimableBdg };
    localStorage.setItem(`gameState_${STORAGE_VERSION}_${username}`, JSON.stringify(gameState));
  }, [slots, coinBdg, claimableBdg, username]);

  useEffect(() => {
    const interval = setInterval(saveData, 5000);
    return () => clearInterval(interval);
  }, [saveData]);

  const navButtonStyle = (page) => ({ background: route === page ? '#5a67d8' : '#4a5568', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '10px 0', margin: '0 4px', fontSize: '1.5em', maxWidth: '60px' });

  return (
    <>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem' }}>
        <p>Bem-vindo, {username}!</p>
        <TonConnectButton />
      </header>
      <div style={{ textAlign: 'center', padding: '10px', minHeight: '40px' }}><p>{status}</p></div>
      
      {route === 'mine' && <MiningPage coinBdg={coinBdg} slots={slots} setSlots={setSlots} status={status} setStatus={setStatus} economyData={economyData} />}
      {route === 'shop' && <ShopPage handlePurchase={handlePurchase} handleBuyBdgCoin={handleBuyBdgCoin} />}
      {route === 'user' && <UserPage address={tonAddress} coinBdg={coinBdg} claimableBdg={claimableBdg} username={username} />}
      {route === 'rankings' && <RankingsPage />}

      <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', padding: '0.5rem', background: '#2d3748', gap: '5px' }}>
        <button onClick={() => setRoute('mine')} style={navButtonStyle('mine')} title="Minerar">⛏️</button>
        <button onClick={() => setRoute('shop')} style={navButtonStyle('shop')} title="Loja">🛒</button>
        <button onClick={() => setRoute('user')} style={navButtonStyle('user')} title="Perfil">👤</button>
        <button onClick={() => setRoute('rankings')} style={navButtonStyle('rankings')} title="Rankings">🏆</button>
      </nav>
    </>
  );
}

// ===================================================================================
// COMPONENTE PARA O FLUXO DA WEB (BNB)
// ===================================================================================
function WebFlow({ username }) {
  const [route, setRoute] = useState('mine');
  const [status, setStatus] = useState('Bem-vindo à versão Web!');
  const [coinBdg, setCoinBdg] = useState(0);
  const [slots, setSlots] = useState(initialSlots);
  const [claimableBdg, setClaimableBdg] = useState(0);

  const { address: bnbAddress, isConnected: isBnbConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect: disconnectBnb } = useDisconnect();

  const navButtonStyle = (page) => ({ background: route === page ? '#5a67d8' : '#4a5568', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '10px 0', margin: '0 4px', fontSize: '1.5em', maxWidth: '60px' });

  const ConnectButton = () => (
    isBnbConnected ?
      <button onClick={() => disconnectBnb()} style={{padding: '10px', borderRadius: '5px', border: 'none', background: '#4a5568', color: 'white'}}>{`${bnbAddress.substring(0, 6)}...${bnbAddress.substring(bnbAddress.length - 4)}`}</button> :
      <button onClick={() => connect({ connector: injected() })} style={{padding: '10px 20px', borderRadius: '5px', border: 'none', background: '#6366f1', color: 'white'}}>Conectar Carteira</button>
  );

  return (
    <>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem' }}>
        <p>Bem-vindo, {username}!</p>
        <ConnectButton />
      </header>
      <div style={{ textAlign: 'center', padding: '10px', minHeight: '40px' }}><p>{status}</p></div>

      {route === 'mine' && <MiningPage coinBdg={coinBdg} slots={slots} setSlots={setSlots} status={status} setStatus={setStatus} economyData={economyData} />}
      {route === 'games' && <GamesPage />}
      {route === 'shop' && <ShopPage />} 
      {/* CORREÇÃO: Passando todos os dados necessários para a UserPage */}
      {route === 'user' && <UserPage username={username} coinBdg={coinBdg} claimableBdg={claimableBdg} />}
      {route === 'rankings' && <RankingsPage />}
      
      <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', padding: '0.5rem', background: '#2d3748', gap: '5px' }}>
        <button onClick={() => setRoute('mine')} style={navButtonStyle('mine')} title="Minerar">⛏️</button>
        <button onClick={() => setRoute('shop')} style={navButtonStyle('shop')} title="Loja">🛒</button>
        <button onClick={() => setRoute('games')} style={navButtonStyle('games')} title="Jogos">🎮</button>
        <button onClick={() => setRoute('user')} style={navButtonStyle('user')} title="Perfil">👤</button>
        <button onClick={() => setRoute('rankings')} style={navButtonStyle('rankings')} title="Rankings">🏆</button>
      </nav>
    </>
  );
}

// ===================================================================================
// COMPONENTE PRINCIPAL (ROTEADOR)
// ===================================================================================
export default function App() {
  const [username, setUsername] = useState('');
  const [tempUsername, setTempUsername] = useState('');
  const isTelegram = useMemo(() => typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get('ref');
    if (ref) {
      console.log("Veio de um link de referência:", ref);
    }
  }, []);

  const handleUsernameSubmit = () => {
    const newUsername = tempUsername.trim();
    if (newUsername) {
      setUsername(newUsername);
    }
  };

  const loginScreen = (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', padding: '20px', background: '#18181b', color: '#f4f4f5' }}>
      <h1 style={{ fontFamily: '"Press Start 2P", cursive', color: '#facc15' }}>CryptoDesk</h1>
      <p style={{ marginBottom: '30px' }}>Digite seu nome de usuário para começar</p>
      <input type="text" value={tempUsername} onChange={(e) => setTempUsername(e.target.value)} placeholder="Seu nome aqui" style={{ padding: '10px', borderRadius: '5px', border: '1px solid #4a5568', background: '#2d3748', color: 'white', marginBottom: '20px', width: '90%', maxWidth: '350px' }} />
      <button onClick={handleUsernameSubmit} style={{ padding: '10px 20px', borderRadius: '5px', border: 'none', background: '#6366f1', color: 'white', cursor: 'pointer', fontFamily: '"Press Start 2P", cursive' }}>Entrar</button>
    </div>
  );

  if (!username) {
    return loginScreen;
  }

  return isTelegram ? <TelegramFlow username={username} /> : <WebFlow username={username} />;
}

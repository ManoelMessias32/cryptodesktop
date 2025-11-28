import React, { useState, useEffect, useCallback, useMemo } from 'react';

// Hooks e componentes de bibliotecas externas
import { TonConnectButton, useTonAddress } from '@tonconnect/ui-react';
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
const STORAGE_VERSION = 'v39_final_split_logic'; 
const ONE_HOUR_IN_SECONDS = 3600;
const SEVEN_DAYS_IN_SECONDS = 7 * 24 * 3600;
const initialSlots = [{ name: 'Slot 1', filled: true, free: true, type: 'free', tier: 0, repairCooldown: ONE_HOUR_IN_SECONDS, durability: SEVEN_DAYS_IN_SECONDS }];

// ===================================================================================
// COMPONENTE PRINCIPAL
// ===================================================================================
export default function App() {
  const [username, setUsername] = useState(() => localStorage.getItem('last_username') || '');
  const [tempUsername, setTempUsername] = useState('');
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [slots, setSlots] = useState(initialSlots);
  const [coinBdg, setCoinBdg] = useState(0);
  const [claimableBdg, setClaimableBdg] = useState(0);

  const isTelegram = useMemo(() => typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp, []);

  // Efeito para carregar os dados do usuário logado
  useEffect(() => {
    if (username) {
      const savedState = localStorage.getItem(`gameState_${STORAGE_VERSION}_${username}`);
      if (savedState) {
        const data = JSON.parse(savedState);
        setSlots(data.slots || initialSlots);
        setCoinBdg(data.coinBdg || 0);
        setClaimableBdg(data.claimableBdg || 0);
      }
      setIsDataLoaded(true);
    }
  }, [username]);

  // Efeito para salvar os dados
  useEffect(() => {
    if (isDataLoaded) {
      const gameState = { slots, coinBdg, claimableBdg };
      localStorage.setItem(`gameState_${STORAGE_VERSION}_${username}`, JSON.stringify(gameState));
    }
  }, [slots, coinBdg, claimableBdg, isDataLoaded, username]);

  // Efeito para o loop de mineração
  useEffect(() => {
    if (!isDataLoaded) return;
    const gameLoop = setInterval(() => {
      setSlots(currentSlots => {
        let totalGain = 0;
        const updatedSlots = currentSlots.map(slot => {
          if (slot.filled && slot.repairCooldown > 0 && slot.durability > 0) {
            const econKey = slot.type === 'free' ? 'free' : slot.tier;
            const gainRate = (economyData[econKey]?.gainPerHour || 0) / 3600;
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
    }, 1000);
    return () => clearInterval(gameLoop);
  }, [isDataLoaded, slots]);

  const handleUsernameSubmit = () => {
    const newUsername = tempUsername.trim();
    if (newUsername) {
      localStorage.setItem('last_username', newUsername);
      setUsername(newUsername);
      setIsDataLoaded(false);
    }
  };

  if (!username) {
    return <LoginScreen tempUsername={tempUsername} setTempUsername={setTempUsername} handleUsernameSubmit={handleUsernameSubmit} />;
  }

  if (!isDataLoaded) {
    return <div style={{display: 'flex', justifyContent:'center', alignItems:'center', height:'100vh', background:'#18181b', color:'#facc15'}}>Carregando seus dados...</div>;
  }

  const flowProps = { username, slots, setSlots, coinBdg, claimableBdg, setCoinBdg };
  return isTelegram ? <TelegramFlow {...flowProps} /> : <WebFlow {...flowProps} />;
}

// ===================================================================================
// COMPONENTES DE FLUXO (TELEGRAM E WEB)
// ===================================================================================
function TelegramFlow({ username, slots, setSlots, coinBdg, claimableBdg }) {
  const [route, setRoute] = useState('mine');
  const [status, setStatus] = useState('Bem-vindo ao CryptoDesk!');
  const tonAddress = useTonAddress();

  useEffect(() => {
    if (window.Telegram && window.Telegram.WebApp) window.Telegram.WebApp.ready();
  }, []);

  const navButtonStyle = (page) => ({ background: route === page ? '#5a67d8' : '#4a5568', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '10px 0', margin: '0 4px', fontSize: '1.5em', maxWidth: '60px' });

  return (
    <>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', color: '#f4f4f5' }}>
        <p>Bem-vindo, {username}!</p>
        <TonConnectButton />
      </header>
      <div style={{ textAlign: 'center', padding: '10px', minHeight: '40px', color: '#d4d4d8' }}><p>{status}</p></div>
      {route === 'mine' && <MiningPage coinBdg={coinBdg} slots={slots} setSlots={setSlots} setStatus={setStatus} economyData={economyData} />}
      {route === 'shop' && <ShopPage />}
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

function WebFlow({ username, slots, setSlots, coinBdg, claimableBdg }) {
  const [route, setRoute] = useState('mine');
  const [status, setStatus] = useState('Bem-vindo à versão Web!');
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
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', color: '#f4f4f5' }}>
        <p>Bem-vindo, {username}!</p>
        <ConnectButton />
      </header>
      <div style={{ textAlign: 'center', padding: '10px', minHeight: '40px', color: '#d4d4d8' }}><p>{status}</p></div>
      {route === 'mine' && <MiningPage coinBdg={coinBdg} slots={slots} setSlots={setSlots} setStatus={setStatus} economyData={economyData} />}
      {route === 'games' && <GamesPage />}
      {route === 'shop' && <ShopPage />} 
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

function LoginScreen({ tempUsername, setTempUsername, handleUsernameSubmit }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', padding: '20px', background: '#18181b', color: '#f4f4f5' }}>
      <h1 style={{ fontFamily: '"Press Start 2P", cursive', color: '#facc15' }}>CryptoDesk</h1>
      <p style={{ marginBottom: '30px' }}>Digite seu nome de usuário para começar</p>
      <input type="text" value={tempUsername} onChange={(e) => setTempUsername(e.target.value)} placeholder="Seu nome aqui" style={{ padding: '10px', borderRadius: '5px', border: '1px solid #4a5568', background: '#2d3748', color: 'white', marginBottom: '20px', width: '90%', maxWidth: '350px' }} />
      <button onClick={handleUsernameSubmit} style={{ padding: '10px 20px', borderRadius: '5px', border: 'none', background: '#6366f1', color: 'white', cursor: 'pointer', fontFamily: '"Press Start 2P", cursive' }}>Entrar</button>
    </div>
  );
}

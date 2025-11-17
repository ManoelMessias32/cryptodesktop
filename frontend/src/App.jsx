import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import MiningPage from './MiningPage';
import ShopPage from './ShopPage';
import UserPage from './UserPage';
import RankingsPage from './RankingsPage';
import { connectWallet } from './wallet';

// --- Constants for BNB Testnet ---
const TOKEN_ADDRESS = '0xcB2e51011e60841B56e278291831E8A4b0D301B2';
const SHOP_ADDRESS = '0xeD266DC6Fd8b5124eec783c58BB351E0Bc3C7d59';
const TOKEN_ABI = ['function balanceOf(address owner) view returns (uint256)', 'function decimals() view returns (uint8)'];
const SHOP_ABI = ['function buyWithBNB(uint256,address) external payable'];
const MAX_SLOTS = 6;
const TWENTY_FOUR_HOURS_IN_SECONDS = 24 * 60 * 60;

export const economyData = {
  free: { tier: 0, gain: 12000, energyCost: 10000, coolerCost: 1250, repairCost: 30000 },
  1: { tier: 1, gain: 16000, energyCost: 12000, coolerCost: 1667, repairCost: 50000 },
  2: { tier: 2, gain: 21000, energyCost: 15000, coolerCost: 2083, repairCost: 80000 },
  3: { tier: 3, gain: 26000, energyCost: 18000, coolerCost: 2083, repairCost: 120000 },
  A: { tier: 1, gain: 16000, energyCost: 20000, coolerCost: 0, repairCost: 150000 },
  B: { tier: 2, gain: 21000, energyCost: 30000, coolerCost: 0, repairCost: 200000 },
  C: { tier: 3, gain: 26000, energyCost: 40000, coolerCost: 0, repairCost: 250000 },
};

const getTodayString = () => new Date().toISOString().split('T')[0];

const initialSlots = [{
  name: 'CPU 1 (Grátis)',
  filled: false,
  free: true,
  type: 'free',
  repairCooldown: TWENTY_FOUR_HOURS_IN_SECONDS,
  isBroken: false
}];

export default function App() {
  const [route, setRoute] = useState('mine');
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState('Conecte sua carteira para começar.');
  const [coinBdg, setCoinBdg] = useState(() => Number(localStorage.getItem('cryptoDesktopMined_v9')) || 0);
  const [tokenBdg, setTokenBdg] = useState('0');
  const [slots, setSlots] = useState(() => {
    try {
      const savedSlots = localStorage.getItem('cryptoDesktopSlots_v9');
      return savedSlots ? JSON.parse(savedSlots) : initialSlots;
    } catch (e) { return initialSlots; }
  });
  const [adBoostTime, setAdBoostTime] = useState(() => Number(localStorage.getItem('adBoostTime_v7')) || 0);
  const [paidBoostTime, setPaidBoostTime] = useState(() => Number(localStorage.getItem('paidBoostTime_v6')) || 0);
  const [adSessionsLeft, setAdSessionsLeft] = useState(3);
  const [lastAdSessionDate, setLastAdSessionDate] = useState(() => localStorage.getItem('lastAdSessionDate_v7') || '');

  const tierPrices = { 1: '0.10', 2: '0.20', 3: '0.30' };

  useEffect(() => { localStorage.setItem('cryptoDesktopSlots_v9', JSON.stringify(slots)); }, [slots]);
  useEffect(() => { localStorage.setItem('cryptoDesktopMined_v9', coinBdg); }, [coinBdg]);
  useEffect(() => { localStorage.setItem('adBoostTime_v7', adBoostTime); }, [adBoostTime]);
  useEffect(() => { localStorage.setItem('paidBoostTime_v6', paidBoostTime); }, [paidBoostTime]);
  useEffect(() => { localStorage.setItem('lastAdSessionDate_v7', lastAdSessionDate); }, [lastAdSessionDate]);


  const handleConnect = async () => {
    try {
      const { address: userAddress } = await connectWallet();
      setAddress(userAddress);
      setStatus('Carteira conectada com sucesso!');
    } catch (e) {
      setStatus(`Falha ao conectar: ${e.message}`);
    }
  };
  
  const gameLoop = useCallback(() => {
    // Game loop logic...
  }, [slots, adBoostTime, paidBoostTime]);

  useEffect(() => {
    if (!address) return;
    const interval = setInterval(gameLoop, 1000);
    return () => clearInterval(interval);
  }, [address, gameLoop]);

  const handlePurchase = async (tierToBuy, purchaseType) => {
    // Purchase logic...
  };

  const addNewSlot = () => {
    // Add new slot logic...
  };

  const renderPage = () => {
    const pageProps = { coinBdg, setCoinBdg, slots, setSlots, addNewSlot, setStatus, adBoostTime, paidBoostTime, setPaidBoostTime, adSessionsLeft, setAdSessionsLeft, setLastAdSessionDate, economyData };
    switch (route) {
      case 'user': return <UserPage address={address} />;
      case 'shop': return <ShopPage onPurchase={handlePurchase} />;
      case 'mine': return <MiningPage {...pageProps} />;
      case 'rank': return <RankingsPage />;
      default: return <MiningPage {...pageProps} />;
    }
  };

  const styles = {
    appContainer: { fontFamily: 'Arial, sans-serif', background: '#1a1a2e', color: '#e0e0e0', minHeight: '100vh', padding: '16px' },
    header: { display: 'flex', justifyContent: 'space-around', padding: '12px', background: '#162447', borderRadius: '8px', marginBottom: '16px' },
    balanceBox: { textAlign: 'center' },
    balanceLabel: { fontSize: '0.8em', color: '#a0a0a0', margin: 0 },
    balanceAmount: { fontSize: '1.2em', fontWeight: 'bold', margin: '4px 0 0 0', color: '#fff' },
    statusBar: { textAlign: 'center', padding: '8px', background: 'rgba(0,0,0,0.2)', borderRadius: '4px', marginBottom: '16px', minHeight: '24px' },
    nav: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', background: '#162447', padding: '10px 0' },
    navButton: { background: 'none', border: 'none', cursor: 'pointer', textAlign: 'center', color: '#e0e0e0', fontSize: '0.8em' },
    connectContainer: { textAlign: 'center', paddingTop: '50px' }
  };

  if (!address) {
    return (
      <div style={styles.appContainer}>
        <div style={styles.connectContainer}>
          <h2>Bem-vindo ao CryptoDesktop</h2>
          <p>Conecte sua carteira MetaMask para começar a jogar.</p>
          <button onClick={handleConnect} style={{fontSize: '1.2em', padding: '15px 30px', cursor: 'pointer'}}>Conectar MetaMask</button>
          <p style={{marginTop: '20px'}}>{status}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.appContainer}>
      <header style={styles.header}>
        <div style={styles.balanceBox}><p style={styles.balanceLabel}>Coin BDG (Jogo)</p><p style={styles.balanceAmount}>{Math.floor(coinBdg)}</p></div>
        <div style={styles.balanceBox}><p style={styles.balanceLabel}>Token BDG (Carteira)</p><p style={styles.balanceAmount}>0.0000</p></div>
      </header>
      <div style={styles.statusBar}>{status}</div>
      <main style={{ paddingBottom: '80px' }}>{renderPage()}</main>
      <nav style={styles.nav}>
        <button onClick={() => setRoute('user')}>Usuário</button>
        <button onClick={() => setRoute('shop')}>Loja</button>
        <button onClick={() => setRoute('mine')}>Mineração</button>
        <button onClick={() => setRoute('rank')}>Ranques</button>
      </nav>
    </div>
  );
}

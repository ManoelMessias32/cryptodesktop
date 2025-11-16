import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import MiningPage from './MiningPage';
import ShopPage from './ShopPage';
import UserPage from './UserPage';
import RankingsPage from './RankingsPage';
import { connectWallet } from './wallet';

// --- Constants ---
const TOKEN_ADDRESS = '0xcB2e51011e60841B56e278291831E8A4b0D301B2';
const TOKEN_ABI = ['function balanceOf(address owner) view returns (uint256)', 'function decimals() view returns (uint8)'];
const SHOP_ADDRESS = '0x35878269EF4051Df5f82593b4819E518bA8903A3';
const SHOP_ABI = ['function buyWithBNB(uint256,address) external payable'];
const MAX_SLOTS = 6;
const MAX_ENERGY = 100;
const REPAIR_TIME = 300; // 5 minutos
const TWENTY_FOUR_HOURS_IN_SECONDS = 24 * 60 * 60;
const initialSlots = [{ name: 'CPU 1 (Grátis)', filled: false, free: true, type: 'free', repairCooldown: TWENTY_FOUR_HOURS_IN_SECONDS, isBroken: false }];

const economyData = {
  free: { tier: 0, gain: 12000, energyCost: 10000, coolerCost: 1250, repairCost: 30000 },
  1: { tier: 1, gain: 16000, energyCost: 12000, coolerCost: 1667, repairCost: 50000 },
  2: { tier: 2, gain: 21000, energyCost: 15000, coolerCost: 2083, repairCost: 80000 },
  3: { tier: 3, gain: 26000, energyCost: 18000, coolerCost: 2083, repairCost: 120000 },
  A: { tier: 1, repairCost: 150000 },
  B: { tier: 2, repairCost: 200000 },
  C: { tier: 3, repairCost: 250000 },
};

export default function App() {
  // --- State ---
  const [route, setRoute] = useState('mine');
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState('Conecte sua carteira para começar.');
  const [coinBdg, setCoinBdg] = useState(() => Number(localStorage.getItem('cryptoDesktopMined_v5')) || 0);
  const [tokenBdg, setTokenBdg] = useState('0');
  const [slots, setSlots] = useState(() => {
    try {
      const savedSlots = localStorage.getItem('cryptoDesktopSlots_v5');
      return savedSlots ? JSON.parse(savedSlots) : initialSlots;
    } catch (e) { return initialSlots; }
  });
  const [adBoostTime, setAdBoostTime] = useState(() => Number(localStorage.getItem('adBoostTime_v3')) || 0);
  const [paidBoostTime, setPaidBoostTime] = useState(() => Number(localStorage.getItem('paidBoostTime_v2')) || 0);

  const tierPrices = { 1: '0.10', 2: '0.20', 3: '0.30' };

  // --- Effects ---
  useEffect(() => { localStorage.setItem('cryptoDesktopSlots_v5', JSON.stringify(slots)); }, [slots]);
  useEffect(() => { localStorage.setItem('cryptoDesktopMined_v5', coinBdg); }, [coinBdg]);
  useEffect(() => { localStorage.setItem('adBoostTime_v3', adBoostTime); }, [adBoostTime]);
  useEffect(() => { localStorage.setItem('paidBoostTime_v2', paidBoostTime); }, [paidBoostTime]);

  // Auto-reconnect wallet on page load
  useEffect(() => {
    const autoConnect = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setAddress(accounts[0]);
            setStatus('Carteira reconectada.');
            // fetch balances if needed
          }
        } catch (error) {
          console.error("Falha ao reconectar automaticamente.");
        }
      }
    };
    autoConnect();
  }, []);

  // Main Game Loop
  useEffect(() => {
    const gameLoop = setInterval(() => {
      let totalGainPerHour = 0;
      let totalCostPerHour = 0;

      const isAdBoostActive = adBoostTime > 0;
      const isPaidBoostActive = paidBoostTime > 0;

      if (isAdBoostActive) setAdBoostTime(prev => prev - 1);
      if (isPaidBoostActive) setPaidBoostTime(prev => prev - 1);

      const newSlots = slots.map(slot => {
        if (!slot.filled || slot.isBroken) return slot;

        let slotEcon = economyData[slot.tier] || economyData.free;
        if (slot.type === 'free') slotEcon = economyData.free;

        if (slot.type === 'special') {
            slotEcon = economyData[slot.tier];
        }

        totalGainPerHour += slotEcon.gain;
        totalCostPerHour += slotEcon.energyCost + slotEcon.coolerCost;

        const newRepairCooldown = slot.repairCooldown > 0 ? slot.repairCooldown - 1 : 0;
        const isBroken = newRepairCooldown <= 0;

        return { ...slot, repairCooldown: newRepairCooldown, isBroken };
      });
      
      setSlots(newSlots);
      
      const netChangePerSecond = (totalGainPerHour - totalCostPerHour) / 3600;
      if (netChangePerSecond !== 0) {
        setCoinBdg(prevCoins => Math.max(0, prevCoins + netChangePerSecond));
      }

    }, 1000);

    return () => clearInterval(gameLoop);
  }, [slots, adBoostTime, paidBoostTime]);
  
  const handleConnect = async () => {
    try {
      const { address: userAddress } = await connectWallet();
      setAddress(userAddress);
      setStatus('Carteira conectada com sucesso!');
    } catch (e) {
      setStatus(`Falha ao conectar: ${e.message}`);
    }
  };

  const handlePurchase = async (tierToBuy, purchaseType) => { /* ... */ };

  const addNewSlot = () => {
    if (slots.length < MAX_SLOTS) {
      setSlots(prev => [...prev, { name: `Gabinete ${prev.length + 1}`, filled: false, free: false, repairCooldown: TWENTY_FOUR_HOURS_IN_SECONDS, isBroken: false }]);
    } else {
      setStatus('Máximo de gabinetes atingido.');
    }
  };

  const renderPage = () => {
    const pageProps = { coinBdg, setCoinBdg, slots, setSlots, addNewSlot, setStatus, economyData, adBoostTime, paidBoostTime, setPaidBoostTime, REPAIR_TIME };
    switch (route) {
      case 'user': return <UserPage address={address} />;
      case 'shop': return <ShopPage onPurchase={handlePurchase} />;
      case 'mine': return <MiningPage {...pageProps} />;
      case 'rank': return <RankingsPage />;
      default: return <MiningPage {...pageProps} />;
    }
  };

  // --- Render ---
  if (!address) {
    return (
      <div style={{ fontFamily: 'Arial, sans-serif', background: '#1a1a2e', color: '#e0e0e0', minHeight: '100vh', padding: '16px', textAlign: 'center', paddingTop: '50px' }}>
        <h2>Bem-vindo ao CryptoDesktop</h2>
        <p>Conecte sua carteira MetaMask para começar a jogar.</p>
        <button onClick={handleConnect} style={{fontSize: '1.2em', padding: '15px 30px', cursor: 'pointer'}}>Conectar MetaMask</button>
        <p style={{marginTop: '20px'}}>{status}</p>
      </div>
    );
  }

  return (
      <div style={{ fontFamily: 'Arial, sans-serif', background: '#1a1a2e', color: '#e0e0e0', minHeight: '100vh', padding: '16px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-around', padding: '12px', background: '#162447', borderRadius: '8px', marginBottom: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
        <div style={{ textAlign: 'center' }}><p style={{ fontSize: '0.8em', color: '#a0a0a0', margin: 0 }}>Coin BDG (Jogo)</p><p style={{ fontSize: '1.2em', fontWeight: 'bold', margin: '4px 0 0 0', color: '#fff' }}>{Math.floor(coinBdg)}</p></div>
        <div style={{ textAlign: 'center' }}><p style={{ fontSize: '0.8em', color: '#a0a0a0', margin: 0 }}>Token BDG (Carteira)</p><p style={{ fontSize: '1.2em', fontWeight: 'bold', margin: '4px 0 0 0', color: '#fff' }}>{parseFloat(tokenBdg).toFixed(4)}</p></div>
      </header>
      <div style={{ textAlign: 'center', padding: '8px', background: 'rgba(0,0,0,0.2)', borderRadius: '4px', marginBottom: '16px', minHeight: '24px' }}>{status}</div>
      <main style={{ paddingBottom: '80px' }}>{renderPage()}</main>
      <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', background: '#162447', padding: '10px 0', boxShadow: '0 -2px 5px rgba(0,0,0,0.3)' }}>
        <button onClick={() => setRoute('user')} style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'center', color: route === 'user' ? '#007bff' : '#e0e0e0', fontSize: '0.8em', fontWeight: route === 'user' ? 'bold' : 'normal' }}>Usuário</button>
        <button onClick={() => setRoute('shop')} style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'center', color: route === 'shop' ? '#007bff' : '#e0e0e0', fontSize: '0.8em', fontWeight: route === 'shop' ? 'bold' : 'normal' }}>Loja</button>
        <button onClick={() => setRoute('mine')} style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'center', color: route === 'mine' ? '#007bff' : '#e0e0e0', fontSize: '0.8em', fontWeight: route === 'mine' ? 'bold' : 'normal' }}>Mineração</button>
        <button onClick={() => setRoute('rank')} style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'center', color: route === 'rank' ? '#007bff' : '#e0e0e0', fontSize: '0.8em', fontWeight: route === 'rank' ? 'bold' : 'normal' }}>Ranques</button>
      </nav>
    </div>
  );
}

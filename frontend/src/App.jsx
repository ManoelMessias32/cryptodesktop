import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import MiningPage from './MiningPage';
import ShopPage from './ShopPage';
import UserPage from './UserPage';
import RankingsPage from './RankingsPage';
import { connectWallet } from './wallet';

// --- Constants ---
const TOKEN_ADDRESS = '0xcB2e51011e60841B56e278291831E8A4b0D301B2';
const SHOP_ADDRESS = '0xeD266DC6Fd8b5124eec783c58BB351E0Bc3C7d59';
const TOKEN_ABI = ['function balanceOf(address owner) view returns (uint256)', 'function decimals() view returns (uint8)'];
const SHOP_ABI = ['function buyWithBNB(uint256,address) external payable'];
const MAX_SLOTS = 6;
const TWENTY_FOUR_HOURS_IN_SECONDS = 24 * 60 * 60;
const AD_BOOST_DURATION = 1200; // 20 minutos

export const economyData = { /* ... */ };
const getTodayString = () => new Date().toISOString().split('T')[0];
const initialSlots = [ /* ... */ ];

export default function App() {
  // --- State ---
  const [route, setRoute] = useState('mine');
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState('Conecte sua carteira para começar.');
  const [coinBdg, setCoinBdg] = useState(() => Number(localStorage.getItem('cryptoDesktopMined_v9')) || 0);
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

  // --- Effects ---
  useEffect(() => { localStorage.setItem('cryptoDesktopSlots_v9', JSON.stringify(slots)); }, [slots]);
  useEffect(() => { localStorage.setItem('cryptoDesktopMined_v9', coinBdg); }, [coinBdg]);
  useEffect(() => { localStorage.setItem('adBoostTime_v7', adBoostTime); }, [adBoostTime]);
  useEffect(() => { localStorage.setItem('paidBoostTime_v6', paidBoostTime); }, [paidBoostTime]);
  useEffect(() => { localStorage.setItem('lastAdSessionDate_v7', lastAdSessionDate); }, [lastAdSessionDate]);

  useEffect(() => { /* Daily ad session reset */ }, [lastAdSessionDate]);
  useEffect(() => { /* Auto-reconnect wallet */ }, []);
  useEffect(() => { /* Game Loop */ }, [address, slots, adBoostTime, paidBoostTime]);
  
  const handleConnect = async () => { /* ... */ };
  const handlePurchase = async (tierToBuy, purchaseType) => { /* ... */ };
  const addNewSlot = () => { /* ... */ };

  // LÓGICA DO BOTÃO DE ANÚNCIO
  const handleAdSessionClick = () => {
    if (adSessionsLeft <= 0) {
      setStatus('❌ Você já usou todos os anúncios de hoje.');
      return;
    }
    if (adBoostTime > 0) {
      setStatus('❌ Um boost de anúncio já está ativo.');
      return;
    }
    
    setAdBoostTime(prev => prev + AD_BOOST_DURATION);
    const newSessionsLeft = adSessionsLeft - 1;
    setAdSessionsLeft(newSessionsLeft);
    localStorage.setItem('adSessionsLeft_v7', newSessionsLeft.toString());
    
    const today = getTodayString();
    if (lastAdSessionDate !== today) {
        setLastAdSessionDate(today);
        localStorage.setItem('lastAdSessionDate_v7', today);
    }

    setStatus(`✅ Boost de 20 minutos ativado! Anúncios restantes: ${newSessionsLeft}`);
  };

  const renderPage = () => {
    const pageProps = { 
      coinBdg, setCoinBdg, slots, setSlots, addNewSlot, setStatus,
      adBoostTime, paidBoostTime, setPaidBoostTime, adSessionsLeft, 
      handleAdSessionClick // PASSANDO A FUNÇÃO PARA A PÁGINA
    };
    switch (route) {
      case 'user': return <UserPage address={address} />;
      case 'shop': return <ShopPage onPurchase={handlePurchase} />;
      case 'mine': return <MiningPage {...pageProps} />;
      case 'rank': return <RankingsPage />;
      default: return <MiningPage {...pageProps} />;
    }
  };

  // ... (Render logic)
}

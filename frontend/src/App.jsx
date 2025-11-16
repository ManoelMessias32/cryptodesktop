import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import MiningPage from './MiningPage';
import ShopPage from './ShopPage';
import UserPage from './UserPage';
import RankingsPage from './RankingsPage';
import { connectWallet } from './wallet';

// --- Constants ---
// ... (Mesmas constantes de antes)
const getTodayString = () => new Date().toISOString().split('T')[0];

export default function App() {
  // --- State ---
  const [route, setRoute] = useState('mine');
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState('Conecte sua carteira para começar.');
  const [coinBdg, setCoinBdg] = useState(() => Number(localStorage.getItem('cryptoDesktopMined_v5')) || 0);
  const [slots, setSlots] = useState(/*...*/);
  const [adBoostTime, setAdBoostTime] = useState(() => Number(localStorage.getItem('adBoostTime_v3')) || 0);
  const [paidBoostTime, setPaidBoostTime] = useState(() => Number(localStorage.getItem('paidBoostTime_v2')) || 0);
  const [adSessionsLeft, setAdSessionsLeft] = useState(3);
  const [lastAdSessionDate, setLastAdSessionDate] = useState(() => localStorage.getItem('lastAdSessionDate_v3') || '');

  // ... (outros estados e constantes)

  // --- Effects ---
  useEffect(() => { /* ... (efeitos de salvar no localStorage) */ }, [/*...*/]);

  // Efeito para resetar o boost de anúncio diário
  useEffect(() => {
    const today = getTodayString();
    if (lastAdSessionDate !== today) {
      setAdSessionsLeft(3);
      localStorage.setItem('adSessionsLeft_v3', '3');
      localStorage.setItem('lastAdSessionDate_v3', today);
      setLastAdSessionDate(today);
    } else {
      const savedSessions = localStorage.getItem('adSessionsLeft_v3');
      if (savedSessions !== null) {
        setAdSessionsLeft(Number(savedSessions));
      }
    }
  }, []);

  // ... (loop principal do jogo, handleConnect, handlePurchase, addNewSlot)
  
  const handleAdSessionClick = () => {
    if (adSessionsLeft > 0 && adBoostTime <= 0) {
        const BOOST_DURATION = 1200; // 20 minutos por anúncio
        setAdBoostTime(prev => prev + BOOST_DURATION);

        const newSessionsLeft = adSessionsLeft - 1;
        setAdSessionsLeft(newSessionsLeft);
        localStorage.setItem('adSessionsLeft_v3', newSessionsLeft);
        
        setStatus(`✅ Boost de 20 minutos ativado! Anúncios restantes hoje: ${newSessionsLeft}`);
    }
  };

  const renderPage = () => {
    const pageProps = { 
        coinBdg, setCoinBdg, slots, setSlots, addNewSlot, setStatus, 
        adBoostTime, paidBoostTime, setPaidBoostTime, adSessionsLeft, handleAdSessionClick, 
        economyData 
    };
    // ... (switch para renderizar a página)
  };

  // ... (código de renderização)
}

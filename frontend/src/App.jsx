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
const REPAIR_TIME = 60;
const initialSlots = [{ name: 'CPU 1 (Grátis)', filled: false, free: true, type: 'free', energy: MAX_ENERGY, timer: REPAIR_TIME, needsRepair: false }];

export default function App() {
  // --- State ---
  const [route, setRoute] = useState('mine');
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState('Conecte sua carteira para começar.');
  const [coinBdg, setCoinBdg] = useState(() => Number(localStorage.getItem('cryptoDesktopMined_v4')) || 0);
  const [tokenBdg, setTokenBdg] = useState('0');
  const [slots, setSlots] = useState(() => {
    try {
      const savedSlots = localStorage.getItem('cryptoDesktopSlots_v4');
      const parsed = savedSlots ? JSON.parse(savedSlots) : initialSlots;
      return parsed.map(s => ({ ...s, energy: s.energy ?? MAX_ENERGY, timer: s.timer ?? REPAIR_TIME, needsRepair: s.needsRepair ?? false }));
    } catch (e) { return initialSlots; }
  });
  const [adBoostTime, setAdBoostTime] = useState(() => Number(localStorage.getItem('adBoostTime_v3')) || 0);
  const [paidBoostTime, setPaidBoostTime] = useState(() => Number(localStorage.getItem('paidBoostTime_v2')) || 0);

  const tierPrices = { 1: '0.10', 2: '0.20', 3: '0.30' };

  // --- Effects ---
  useEffect(() => { localStorage.setItem('cryptoDesktopSlots_v4', JSON.stringify(slots)); }, [slots]);
  useEffect(() => { localStorage.setItem('cryptoDesktopMined_v4', coinBdg); }, [coinBdg]);
  useEffect(() => { localStorage.setItem('adBoostTime_v3', adBoostTime); }, [adBoostTime]);
  useEffect(() => { localStorage.setItem('paidBoostTime_v2', paidBoostTime); }, [paidBoostTime]);

  const fetchTokenBalance = async (userAddress) => {
      if (!userAddress) return;
      try {
        const { provider } = await connectWallet();
        const tokenContract = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, provider);
        const balance = await tokenContract.balanceOf(userAddress);
        const decimals = await tokenContract.decimals();
        setTokenBdg(ethers.utils.formatUnits(balance, decimals));
      } catch (error) {}
  };

  const handleConnect = async () => {
    try {
      const { address: userAddress } = await connectWallet();
      setAddress(userAddress);
      setStatus('Carteira conectada com sucesso!');
      fetchTokenBalance(userAddress);
    } catch (e) {
      setStatus(`Falha ao conectar: ${e.message}`);
    }
  };
  
  useEffect(() => {
    const gameLoop = setInterval(() => {
      const isAdBoostActive = adBoostTime > 0;
      const isPaidBoostActive = paidBoostTime > 0;

      if (isAdBoostActive) setAdBoostTime(prev => prev - 1);
      if (isPaidBoostActive) setPaidBoostTime(prev => prev - 1);

      if (isAdBoostActive || isPaidBoostActive) return;

      setSlots(currentSlots => 
        currentSlots.map(slot => {
          if (!slot.filled || slot.needsRepair) return slot;
          const newTimer = slot.timer > 0 ? slot.timer - 1 : 0;
          const newEnergy = newTimer > 0 ? slot.energy - 1 : slot.energy;
          const needsRepair = newEnergy <= 0 || newTimer <= 0;
          return { ...slot, timer: newTimer, energy: newEnergy, needsRepair };
        })
      );
    }, 1000);

    return () => clearInterval(gameLoop);
  }, [adBoostTime, paidBoostTime]);

  const handlePurchase = async (tierToBuy, purchaseType) => {
    const emptySlotIndex = slots.findIndex(slot => !slot.filled && !slot.free);
    if (emptySlotIndex === -1) {
      setStatus('❌ Você precisa de um gabinete vazio! Compre um na página de Mineração.');
      return;
    }
    try {
      setStatus('Conectando carteira...');
      const { signer } = await connectWallet();
      const price = tierPrices[tierToBuy];
      const shopContract = new ethers.Contract(SHOP_ADDRESS, SHOP_ABI, signer);
      setStatus(`Enviando ${price} BNB... Por favor, confirme na MetaMask.`);
      const value = ethers.utils.parseEther(price);
      const tx = await shopContract.buyWithBNB(tierToBuy, ethers.constants.AddressZero, { value });
      await tx.wait();
      setSlots(prev => prev.map((slot, i) => (i === emptySlotIndex ? { ...slot, filled: true, type: purchaseType, tier: tierToBuy, name: `Gabinete ${emptySlotIndex+1}` } : slot)));
      setStatus(`✅ Compra realizada! CPU instalada no Gabinete ${emptySlotIndex + 1}.`);
    } catch (e) {
      setStatus(`❌ Erro na compra: ${e.message || 'Transação cancelada.'}`);
    }
  };

  const addNewSlot = () => {
    if (slots.length < MAX_SLOTS) {
      setSlots(prev => [...prev, { name: `Gabinete ${prev.length + 1}`, filled: false, free: false, energy: MAX_ENERGY, timer: REPAIR_TIME, needsRepair: false }]);
    } else {
      setStatus('Máximo de gabinetes atingido.');
    }
  };

  const renderPage = () => {
    const pageProps = { coinBdg, setCoinBdg, slots, setSlots, addNewSlot, setStatus, adBoostTime, paidBoostTime, setPaidBoostTime, MAX_ENERGY, REPAIR_TIME };
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
    header: { display: 'flex', justifyContent: 'space-around', padding: '12px', background: '#162447', borderRadius: '8px', marginBottom: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.3)' },
    balanceBox: { textAlign: 'center' },
    balanceLabel: { fontSize: '0.8em', color: '#a0a0a0', margin: 0 },
    balanceAmount: { fontSize: '1.2em', fontWeight: 'bold', margin: '4px 0 0 0', color: '#fff' },
    statusBar: { textAlign: 'center', padding: '8px', background: 'rgba(0,0,0,0.2)', borderRadius: '4px', marginBottom: '16px', minHeight: '24px' },
    nav: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', background: '#162447', padding: '10px 0', boxShadow: '0 -2px 5px rgba(0,0,0,0.3)' },
    navButton: { background: 'none', border: 'none', cursor: 'pointer', textAlign: 'center', color: '#e0e0e0', fontSize: '0.8em' },
    navButtonActive: { color: '#007bff', fontWeight: 'bold' },
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
        <div style={styles.balanceBox}><p style={styles.balanceLabel}>Token BDG (Carteira)</p><p style={styles.balanceAmount}>{parseFloat(tokenBdg).toFixed(4)}</p></div>
      </header>
      <div style={styles.statusBar}>{status}</div>
      <main style={{ paddingBottom: '80px' }}>{renderPage()}</main>
      <nav style={styles.nav}>
        <button onClick={() => setRoute('user')} style={{...styles.navButton, ...(route === 'user' && styles.navButtonActive)}}>Usuário</button>
        <button onClick={() => setRoute('shop')} style={{...styles.navButton, ...(route === 'shop' && styles.navButtonActive)}}>Loja</button>
        <button onClick={() => setRoute('mine')} style={{...styles.navButton, ...(route === 'mine' && styles.navButtonActive)}}>Mineração</button>
        <button onClick={() => setRoute('rank')} style={{...styles.navButton, ...(route === 'rank' && styles.navButtonActive)}}>Ranques</button>
      </nav>
    </div>
  );
}

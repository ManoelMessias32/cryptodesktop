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
const SHOP_ADDRESS = '0xeD266DC6Fd8b5124eec783c58BB351E0Bc3C7d59';
const SHOP_ABI = ['function buyWithBNB(uint256,address) external payable'];
const MAX_SLOTS = 6;
const initialSlots = [{ name: 'CPU 1 (Grátis)', filled: false, free: true, type: 'free' }];

export default function App() {
  // --- State ---
  const [route, setRoute] = useState('mine');
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState('Pronto para começar!');
  const [coinBdg, setCoinBdg] = useState(() => Number(localStorage.getItem('cryptoDesktopMined_v3')) || 0);
  const [tokenBdg, setTokenBdg] = useState('0');
  const [slots, setSlots] = useState(() => {
    try {
      const savedSlots = localStorage.getItem('cryptoDesktopSlots_v3');
      return savedSlots ? JSON.parse(savedSlots) : initialSlots;
    } catch (e) { return initialSlots; }
  });

  const tierPrices = { 1: '0.10', 2: '0.20', 3: '0.30' };

  // --- Effects ---
  useEffect(() => {
    localStorage.setItem('cryptoDesktopSlots_v3', JSON.stringify(slots));
  }, [slots]);
  
  useEffect(() => {
    localStorage.setItem('cryptoDesktopMined_v3', coinBdg);
  }, [coinBdg]);

  // ... (efeitos de conexão e atualização de saldo)

  // --- Core Functions ---
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
      
      setSlots(prev => prev.map((slot, i) => (i === emptySlotIndex ? { ...slot, filled: true, type: purchaseType, tier: tierToBuy } : slot)));
      setStatus(`✅ Compra realizada! CPU instalada no Gabinete ${emptySlotIndex + 1}.`);
    } catch (e) {
      setStatus(`❌ Erro na compra: ${e.message || 'Transação cancelada.'}`);
    }
  };

  const addNewSlot = () => {
    if (slots.length < MAX_SLOTS) {
      const newSlot = { name: `Gabinete ${slots.length + 1}`, filled: false, free: false };
      setSlots(prevSlots => [...prevSlots, newSlot]);
    } else {
      setStatus('Você atingiu o número máximo de gabinetes.');
    }
  };

  const renderPage = () => {
    switch (route) {
      case 'user': return <UserPage address={address} />;
      case 'shop': return <ShopPage onPurchase={handlePurchase} />;
      case 'mine': return <MiningPage coinBdg={coinBdg} setCoinBdg={setCoinBdg} slots={slots} setSlots={setSlots} addNewSlot={addNewSlot} setStatus={setStatus} />;
      case 'rank': return <RankingsPage />;
      default: return <MiningPage coinBdg={coinBdg} setCoinBdg={setCoinBdg} slots={slots} setSlots={setSlots} addNewSlot={addNewSlot} setStatus={setStatus} />;
    }
  };

  // --- Styles ---
  const styles = {
    appContainer: { fontFamily: 'Arial, sans-serif', background: '#1a1a2e', color: '#e0e0e0', minHeight: '100vh', padding: '16px' },
    header: { display: 'flex', justifyContent: 'space-around', padding: '12px', background: '#162447', borderRadius: '8px', marginBottom: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.3)' },
    balanceBox: { textAlign: 'center' },
    balanceLabel: { fontSize: '0.8em', color: '#a0a0a0', margin: 0 },
    balanceAmount: { fontSize: '1.2em', fontWeight: 'bold', margin: '4px 0 0 0', color: '#fff' },
    statusBar: { textAlign: 'center', padding: '8px', background: 'rgba(0,0,0,0.2)', borderRadius: '4px', marginBottom: '16px', minHeight: '24px' },
    nav: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', background: '#162447', padding: '10px 0', boxShadow: '0 -2px 5px rgba(0,0,0,0.3)' },
    navButton: { background: 'none', border: 'none', cursor: 'pointer', textAlign: 'center', color: '#e0e0e0', fontSize: '0.8em' },
    navButtonActive: { color: '#1f4068', fontWeight: 'bold' },
  };

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

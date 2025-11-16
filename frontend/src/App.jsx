import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import MiningPage from './MiningPage';
import ShopPage from './ShopPage';
import UserPage from './UserPage';
import RankingsPage from './RankingsPage';
import { connectWallet } from './wallet';

const TOKEN_ADDRESS = '0xcB2e51011e60841B56e278291831E8A4b0D301B2';
const TOKEN_ABI = ['function balanceOf(address owner) view returns (uint256)', 'function decimals() view returns (uint8)'];

const initialSlots = [{ name: 'CPU 1 (Grátis)', filled: false, free: true, type: 'free' }];
const MAX_SLOTS = 6;

export default function App() {
  // --- State ---
  const [route, setRoute] = useState('mine');
  const [address, setAddress] = useState('');
  const [coinBdg, setCoinBdg] = useState(() => Number(localStorage.getItem('cryptoDesktopMined_v3')) || 0);
  const [tokenBdg, setTokenBdg] = useState('0');
  const [status, setStatus] = useState('');
  const [slots, setSlots] = useState(() => {
    try {
      const savedSlots = localStorage.getItem('cryptoDesktopSlots_v3');
      return savedSlots ? JSON.parse(savedSlots) : initialSlots;
    } catch (e) {
      return initialSlots;
    }
  });

  const tierPrices = { 1: '0.10', 2: '0.20', 3: '0.30' };

  // --- Effects ---
  useEffect(() => {
    localStorage.setItem('cryptoDesktopSlots_v3', JSON.stringify(slots));
  }, [slots]);

  useEffect(() => { /* Efeitos de saldo e conexão */ }, [address]);

  // --- Core Functions ---
  const handlePurchaseFromShop = async (tierToBuy, purchaseType) => {
    const emptySlotIndex = slots.findIndex(slot => !slot.filled && !slot.free);

    if (emptySlotIndex === -1) {
      setStatus('Você precisa de um gabinete vazio! Compre um novo na página de mineração.');
      return;
    }

    try {
      setStatus('Conectando carteira...');
      const { signer } = await connectWallet();
      const price = tierPrices[tierToBuy];
      const shopContract = new ethers.Contract('0xeD266DC6Fd8b5124eec783c58BB351E0Bc3C7d59', ['function buyWithBNB(uint256,address) external payable'], signer);
      
      setStatus(`Enviando ${price} BNB... Por favor, confirme na sua MetaMask.`);
      const value = ethers.utils.parseEther(price);
      const tx = await shopContract.buyWithBNB(tierToBuy, ethers.constants.AddressZero, { value });
      await tx.wait();
      
      setSlots(prev => prev.map((slot, i) => (i === emptySlotIndex ? { ...slot, filled: true, type: purchaseType, tier: tierToBuy } : slot)));
      setStatus(`Compra realizada com sucesso e CPU instalada no Gabinete ${emptySlotIndex + 1}!`);
    } catch (e) {
      setStatus(`Erro na compra: ${e.message || 'Transação cancelada.'}`);
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
      case 'shop': return <ShopPage onPurchase={handlePurchaseFromShop} />;
      case 'mine': return <MiningPage setCoinBdg={setCoinBdg} slots={slots} setSlots={setSlots} addNewSlot={addNewSlot} />; 
      case 'rank': return <RankingsPage />;
      default: return <MiningPage setCoinBdg={setCoinBdg} slots={slots} setSlots={setSlots} addNewSlot={addNewSlot} />;
    }
  };

  // --- Styles ---
  const styles = { /* ... styles ... */ };

  return (
    <div style={styles.appContainer}>
        {/* ... header, main content, nav ... */}
    </div>
  );
}

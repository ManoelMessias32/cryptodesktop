import React, { useState, useEffect, useCallback } from 'react';
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

  useEffect(() => { /* Daily ad session reset */ }, [lastAdSessionDate]);

  useEffect(() => {
    const autoConnect = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setAddress(accounts[0]);
            setStatus('Carteira reconectada.');
          }
        } catch (error) {}
      }
    };
    autoConnect();
  }, []);

  useEffect(() => {
    if (!address) return;

    const interval = setInterval(() => {
        let totalGainPerHour = 0;
        let totalCostPerHour = 0;

        setAdBoostTime(prev => Math.max(0, prev - 1));
        setPaidBoostTime(prev => Math.max(0, prev - 1));
        const isBoostActive = (adBoostTime > 1 || paidBoostTime > 1); // Check against 1 to account for the update lag

        setSlots(currentSlots => {
            return currentSlots.map(slot => {
                if (!slot.filled || slot.isBroken) return slot;

                const econKey = slot.type === 'free' ? 'free' : (slot.type === 'standard' ? slot.tier : Object.keys(economyData).find(k => economyData[k].tier === slot.tier && k.length === 1));
                const slotEcon = economyData[econKey];
                
                if (slotEcon) {
                    totalGainPerHour += slotEcon.gain;
                    if (!isBoostActive) {
                        totalCostPerHour += (slotEcon.energyCost + slotEcon.coolerCost);
                    }
                }

                const newRepairCooldown = slot.repairCooldown > 0 ? slot.repairCooldown - 1 : 0;
                const isBroken = newRepairCooldown <= 0;

                return { ...slot, repairCooldown: newRepairCooldown, isBroken };
            });
        });
      
        const netChangePerSecond = (totalGainPerHour - totalCostPerHour) / 3600;
        if(netChangePerSecond !== 0){
            setCoinBdg(prevCoins => Math.max(0, prevCoins + netChangePerSecond));
        }

    }, 1000);

    return () => clearInterval(interval);
  }, [address, adBoostTime, paidBoostTime]);

  const handleConnect = async () => {
    try {
      const { address: userAddress } = await connectWallet();
      setAddress(userAddress);
      setStatus('Carteira conectada com sucesso!');
    } catch (e) {
      setStatus(`Falha ao conectar: ${e.message}`);
    }
  };

  const handlePurchase = async (tierToBuy, purchaseType) => {
    const emptySlotIndex = slots.findIndex(slot => !slot.filled && !slot.free);
    if (emptySlotIndex === -1) {
      setStatus('❌ Você precisa de um gabinete vazio!');
      return;
    }
    try {
      const { signer } = await connectWallet();
      const price = tierPrices[tierToBuy];
      const shopContract = new ethers.Contract(SHOP_ADDRESS, SHOP_ABI, signer);
      setStatus(`Enviando ${price} BNB... Confirme na MetaMask.`);
      const value = ethers.utils.parseEther(price);
      const tx = await shopContract.buyWithBNB(tierToBuy, '0x35878269EF4051Df5f82593b4819E518bA8903A3', { value });
      await tx.wait();
      setSlots(prev => prev.map((slot, i) => (i === emptySlotIndex ? { ...slot, filled: true, type: purchaseType, tier: tierToBuy, name: `Gabinete ${emptySlotIndex+1}`, repairCooldown: TWENTY_FOUR_HOURS_IN_SECONDS, isBroken: false } : slot)));
      setStatus(`✅ Compra realizada!`);
    } catch (e) {
      setStatus(`❌ Erro na compra: ${e.message || 'Transação cancelada.'}`);
    }
  };

  const addNewSlot = () => {
    if (slots.length < MAX_SLOTS) {
      setSlots(prev => [...prev, { name: `Gabinete ${prev.length + 1}`, filled: false, free: false, repairCooldown: 0, isBroken: true, type: 'empty' }]);
    } else {
      setStatus('Máximo de gabinetes atingido.');
    }
  };

  const renderPage = () => {
    const pageProps = { coinBdg, setCoinBdg, slots, setSlots, addNewSlot, setStatus, adBoostTime, paidBoostTime, setPaidBoostTime, adSessionsLeft, setAdSessionsLeft, economyData };
    switch (route) {
      case 'user': return <UserPage address={address} />;
      case 'shop': return <ShopPage onPurchase={handlePurchase} />;
      case 'mine': return <MiningPage {...pageProps} />;
      case 'rank': return <RankingsPage />;
      default: return <MiningPage {...pageProps} />;
    }
  };

  const styles = { /* ... */ };

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

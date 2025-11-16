import React, { useState, useEffect } from 'react';
import { connectWallet } from './wallet';
import { ethers } from 'ethers';

// --- Constants ---
const MAX_SLOTS = 6;
const initialSlot = [{ name: 'CPU 1 (Grátis)', filled: false, free: true, type: 'free' }];
const MAX_ENERGY = 100;
const ENERGY_REFILL_COST = 20;
const PAID_BOOST_COST = 80;
const PAID_BOOST_DURATION = 1800; // 30 minutos

export default function MiningPage({ setCoinBdg }) {
  // --- State Variables ---
  const [slots, setSlots] = useState(() => {
    try {
      const savedSlots = localStorage.getItem('cryptoDesktopSlots_v3');
      return savedSlots ? JSON.parse(savedSlots) : initialSlot;
    } catch (e) {
      return initialSlot;
    }
  });

  const [mined, setMined] = useState(() => Number(localStorage.getItem('cryptoDesktopMined_v3')) || 0);
  const [paidBoostTime, setPaidBoostTime] = useState(() => Number(localStorage.getItem('paidBoostTime_v1')) || 0);
  
  // ... (other states)
  const [slotEnergy, setSlotEnergy] = useState([100, 100, 100, 100, 100, 100]);
  const [adBoostTime, setAdBoostTime] = useState(() => Number(localStorage.getItem('adBoostTime_v2')) || 0);
  const [status, setStatus] = useState('');

  // --- Game Data ---
  const tierPrices = { 1: '0.10', 2: '0.20', 3: '0.30' };
  const specialCpuData = { A: { tier: 1 }, B: { tier: 2 }, C: { tier: 3 } };

  // --- Effects ---
  useEffect(() => {
    setCoinBdg(mined);
    localStorage.setItem('cryptoDesktopMined_v3', mined);
  }, [mined, setCoinBdg]);

  useEffect(() => {
    localStorage.setItem('cryptoDesktopSlots_v3', JSON.stringify(slots));
  }, [slots]);

  useEffect(() => {
    localStorage.setItem('paidBoostTime_v1', paidBoostTime);
  }, [paidBoostTime]);

  // Main game loop
  useEffect(() => {
    const interval = setInterval(() => {
      // Boost timers
      let adBoostActive = false;
      setAdBoostTime(prev => {
        if (prev > 0) { adBoostActive = true; return prev - 1; }
        return 0;
      });

      let paidBoostActive = false;
      setPaidBoostTime(prev => {
        if (prev > 0) { paidBoostActive = true; return prev - 1; }
        return 0;
      });

      // If any boost is active, skip energy consumption
      if (adBoostActive || paidBoostActive) {
        return;
      }
      // ... (energy consumption logic)
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // --- Core Game Functions ---
  const addNewSlot = () => {
    if (slots.length < MAX_SLOTS) {
      const newSlot = { name: `Gabinete ${slots.length + 1}`, filled: false, free: false, tier: 1, purchaseMode: 'standard' };
      setSlots(prevSlots => [...prevSlots, newSlot]);
    } else {
      setStatus('Você atingiu o número máximo de gabinetes.');
    }
  };

  const handleBuyEnergy = () => {
    if (mined >= ENERGY_REFILL_COST) {
      setMined(prev => prev - ENERGY_REFILL_COST);
      setSlotEnergy(prev => prev.map(() => MAX_ENERGY));
      setStatus(`Energia de todos os slots foi restaurada! (-${ENERGY_REFILL_COST} Coin BDG)`);
    } else {
      setStatus('Moedas insuficientes para comprar energia.');
    }
  };

  const handleBuyPaidBoost = () => {
    if (mined >= PAID_BOOST_COST) {
      if (paidBoostTime > 0) {
        setStatus('Um boost pago já está ativo.');
        return;
      }
      setMined(prev => prev - PAID_BOOST_COST);
      setPaidBoostTime(PAID_BOOST_DURATION);
      setStatus(`Boost de 30 minutos ativado! (-${PAID_BOOST_COST} Coin BDG)`);
    } else {
      setStatus('Moedas insuficientes para ativar o boost.');
    }
  };

  // ... (handleBuy, handleMountFree, etc.)

  // --- JSX Render --- 
  return (
    <div>
      {/* ... (other UI sections) ... */}

      {/* Itens Consumíveis Section */}
      <div style={{ marginTop: 24, padding: 12, border: '1px solid #ffc107', borderRadius: 8, background: '#2a2a3e', maxWidth: 420, margin: '24px auto' }}>
        <h4 style={{ color: '#ffc107', marginBottom: 16, textAlign: 'center' }}>Itens Consumíveis (Coin BDG)</h4>
        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
          <div>
            <button onClick={handleBuyEnergy} disabled={mined < ENERGY_REFILL_COST}>Comprar Energia</button>
            <p style={{fontSize: '0.8em', margin: '4px 0 0 0', textAlign: 'center' }}>Custo: {ENERGY_REFILL_COST} Coin BDG</p>
          </div>
          <div>
            <button onClick={handleBuyPaidBoost} disabled={mined < PAID_BOOST_COST || paidBoostTime > 0}>Ativar Boost (30 min)</button>
            <p style={{fontSize: '0.8em', margin: '4px 0 0 0', textAlign: 'center' }}>Custo: {PAID_BOOST_COST} Coin BDG</p>
          </div>
        </div>
        {paidBoostTime > 0 && (
            <p style={{textAlign: 'center', marginTop: '12px'}}>Boost Pago restante: {Math.floor(paidBoostTime / 60)}:{(paidBoostTime % 60).toString().padStart(2, '0')}</p>
        )}
      </div>

      {/* ... (Slot purchase section) ... */}

    </div>
  );
}

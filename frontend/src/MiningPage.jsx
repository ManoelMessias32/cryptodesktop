import React, { useState, useEffect } from 'react';
import { connectWallet } from './wallet';
import { ethers } from 'ethers';

const TOKEN_ADDRESS = '0xcB2e51011e60841B56e278291831E8A4b0D301B2';

// Helper to get date string in a consistent format
const getTodayString = () => new Date().toISOString().split('T')[0];

export default function MiningPage({ setCoinBdg }) {
  // Game state
  const MAX_ENERGY = 100;
  const REPAIR_COST = 50;
  const REPAIR_TIME = 60; // seconds for example
  const [slotEnergy, setSlotEnergy] = useState([MAX_ENERGY, MAX_ENERGY, MAX_ENERGY, MAX_ENERGY, MAX_ENERGY, MAX_ENERGY]);
  const [slotTimers, setSlotTimers] = useState([REPAIR_TIME, REPAIR_TIME, REPAIR_TIME, REPAIR_TIME, REPAIR_TIME, REPAIR_TIME]);
  const [needsRepair, setNeedsRepair] = useState([false, false, false, false, false, false]);

  // Ad Boost State
  const [adBoostTime, setAdBoostTime] = useState(() => Number(localStorage.getItem('adBoostTime_v2')) || 0);
  const [adSessionsLeft, setAdSessionsLeft] = useState(3);
  const [lastAdSessionDate, setLastAdSessionDate] = useState(() => localStorage.getItem('lastAdSessionDate_v2') || '');

  const [mined, setMined] = useState(0);
  const [status, setStatus] = useState('');
  const [miningCount, setMiningCount] = useState(0);
  
  const initialSlots = [
    { name: 'CPU 1 (Grátis)', filled: false, free: true },
    { name: 'CPU 2 (Grátis)', filled: false, free: true },
    { name: 'CPU 3', filled: false, free: false, tier: 1, purchaseMode: 'standard' },
    { name: 'CPU 4', filled: false, free: false, tier: 1, purchaseMode: 'standard' },
    { name: 'CPU 5', filled: false, free: false, tier: 1, purchaseMode: 'standard' },
    { name: 'CPU 6', filled: false, free: false, tier: 1, purchaseMode: 'standard' },
  ];
  const [slots, setSlots] = useState(initialSlots);

  const monthlyBDG = {
    free: '200',
    1: '400–500',
    2: '800–1000',
    3: '1400–1600',
  };

  const piecePrices = {
    motherboard: { 1: '0.02', 2: '0.04', 3: '0.06' },
    cpu: { 1: '0.03', 2: '0.06', 3: '0.09' },
    gpu: { 1: '0.05', 2: '0.10', 3: '0.15' },
  };

  // Preços atualizados para corresponder às CPUs Especiais
  const tierPrices = {
    1: '0.10',
    2: '0.20',
    3: '0.30',
  };

  const specialCpuData = {
    A: { price: '0.10', gain: '1.300', energy: '3 horas', cost: '20.000', maintenance: '30.000', tier: 1 },
    B: { price: '0.20', gain: '1.500', energy: '4 horas', cost: '30.000', maintenance: '40.000', tier: 2 },
    C: { price: '0.30', gain: '1.800', energy: '5 horas', cost: '40.000', maintenance: '50.000', tier: 3 },
  };

  // Pass mined (Coin BDG) balance up to the App component
  useEffect(() => {
    setCoinBdg(mined);
  }, [mined, setCoinBdg]);

  // Main game loop for timers and boost
  useEffect(() => {
    const interval = setInterval(() => {
      // ... (lógica de tempo e boost continua a mesma)
    }, 1000);
    return () => clearInterval(interval);
  }, [slotEnergy, slotTimers, needsRepair]);

  function handleRepairSlot(idx) {
    // ... (lógica de reparo continua a mesma)
  }

  function handleAdSessionClick() {
    // ... (lógica de boost continua a mesma)
  }

  function handleMountFree(idx) {
    setSlots((prev) => prev.map((slot, i) => (i === idx ? { ...slot, filled: true, type: 'standard' } : slot)));
    setStatus(`CPU ${idx + 1} montado gratuitamente com Coin BDG!`);
  }

  async function handleBuy(idx, tierToBuy, purchaseType) {
    try {
      setStatus('Conectando carteira...');
      const { signer } = await connectWallet();
      const price = tierPrices[tierToBuy];
      
      const shop = new ethers.Contract('0xeD266DC6Fd8b5124eec783c58BB351E0Bc3C7d59', ['function buyWithBNB(uint256,address) external payable'], signer);
      setStatus(`Enviando BNB...`);
      
      const value = ethers.utils.parseEther(price);
      const tx = await shop.buyWithBNB(tierToBuy, ethers.constants.AddressZero, { value });
      await tx.wait();
      
      setSlots((prev) => prev.map((slot, i) => (i === idx ? { ...slot, filled: true, type: purchaseType, tier: tierToBuy } : slot)));
      setStatus(`Compra realizada com sucesso!`);
    } catch (e) {
      setStatus('Erro na compra: ' + (e.message || e));
    }
  }

  function doMine() {
    setMined((m) => m + 1);
  }

  // ... (outras funções como claim, etc)

  const setPurchaseMode = (idx, mode) => {
    setSlots(prev => prev.map((s, i) => i === idx ? { ...s, purchaseMode: mode } : s));
  };

  return (
    <div>
      {/* ... (seções de mineração e boost) */}

      {/* Computer Slots Section */}
      <div style={{ marginTop: 24 }}>
        <h3 style={{ textAlign: 'center' }}>Monte seu computador para minerar</h3>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
          {slots.map((slot, idx) => (
            <div key={idx} style={{ border: '2px dashed #aaa', borderRadius: 8, padding: '12px', width: 220, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: slot.filled ? '#e0ffe0' : '#fff' }}>
              <div style={{ fontWeight: 'bold', marginBottom: 8 }}>{slot.name}</div>

              {slot.filled ? (
                <div>
                  <span style={{ color: 'green', fontWeight: 'bold' }}>Montado</span>
                  <p>Tipo: {slot.type === 'standard' ? `Padrão Tier ${slot.tier}` : `Especial CPU ${Object.keys(specialCpuData).find(k => specialCpuData[k].tier === slot.tier)}`}</p>
                </div>
              ) : slot.free ? (
                 <button style={{ fontSize: '0.9em' }} onClick={() => handleMountFree(idx)}>Montar grátis (Coin BDG)</button>
              ) : (
                <>
                  <div style={{ display: 'flex', width: '100%', marginBottom: '12px' }}>
                    <button onClick={() => setPurchaseMode(idx, 'standard')} style={{ flex: 1, padding: '4px', border: slot.purchaseMode === 'standard' ? '2px solid #007bff' : '1px solid #ccc' }}>Padrão</button>
                    <button onClick={() => setPurchaseMode(idx, 'special')} style={{ flex: 1, padding: '4px', border: slot.purchaseMode === 'special' ? '2px solid #007bff' : '1px solid #ccc' }}>Especial</button>
                  </div>

                  {slot.purchaseMode === 'standard' ? (
                    <div>
                      <label>Tier:</label>
                      <select value={slot.tier} onChange={e => setSlots(prev => prev.map((s, i) => i === idx ? { ...s, tier: Number(e.target.value) } : s))}>
                        <option value={1}>Tier 1</option>
                        <option value={2}>Tier 2</option>
                        <option value={3}>Tier 3</option>
                      </select>
                      <div style={{ fontSize: '0.9em', marginTop: 8 }}>
                        <p>Placa-mãe: {piecePrices.motherboard[slot.tier]} BNB</p>
                        <p>Processador: {piecePrices.cpu[slot.tier]} BNB</p>
                        <p>Placa de vídeo: {piecePrices.gpu[slot.tier]} BNB</p>
                        <p style={{ fontWeight: 'bold' }}>Total: {tierPrices[slot.tier]} BNB</p>
                      </div>
                      <button onClick={() => handleBuy(idx, slot.tier, 'standard')}>Comprar Componentes</button>
                    </div>
                  ) : (
                    <div>
                      <label>CPU Especial:</label>
                      <select value={slot.tier} onChange={e => setSlots(prev => prev.map((s, i) => i === idx ? { ...s, tier: Number(e.target.value) } : s))}>
                        <option value={1}>CPU A</option>
                        <option value={2}>CPU B</option>
                        <option value={3}>CPU C</option>
                      </select>
                      <div style={{ fontSize: '0.9em', marginTop: 8 }}>
                        <p>Preço: {specialCpuData[Object.keys(specialCpuData).find(k => specialCpuData[k].tier === slot.tier)].price} BNB</p>
                        <p>Ganho Mensal: {specialCpuData[Object.keys(specialCpuData).find(k => specialCpuData[k].tier === slot.tier)].gain} BDG</p>
                      </div>
                      <button onClick={() => handleBuy(idx, slot.tier, 'special')}>Comprar CPU Especial</button>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

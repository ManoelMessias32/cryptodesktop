import React, { useState, useEffect } from 'react';
import { connectWallet } from './wallet';
import { ethers } from 'ethers';

// --- Helper Functions ---
const getTodayString = () => new Date().toISOString().split('T')[0];

// --- Constants ---
const MAX_SLOTS = 6;
const initialSlot = [{ name: 'CPU 1 (Grátis)', filled: false, free: true }];

export default function MiningPage({ setCoinBdg }) {
  // --- State Variables ---
  const [slots, setSlots] = useState(() => {
    try {
      const savedSlots = localStorage.getItem('cryptoDesktopSlots_v2');
      return savedSlots ? JSON.parse(savedSlots) : initialSlot;
    } catch (e) {
      return initialSlot;
    }
  });

  const [mined, setMined] = useState(() => Number(localStorage.getItem('cryptoDesktopMined_v2')) || 0);
  
  const [slotEnergy, setSlotEnergy] = useState([100, 100, 100, 100, 100, 100]);
  const [slotTimers, setSlotTimers] = useState([60, 60, 60, 60, 60, 60]);
  const [needsRepair, setNeedsRepair] = useState([false, false, false, false, false, false]);
  const [adBoostTime, setAdBoostTime] = useState(() => Number(localStorage.getItem('adBoostTime_v2')) || 0);
  const [adSessionsLeft, setAdSessionsLeft] = useState(3);
  const [status, setStatus] = useState('');

  // --- Game Data ---
  const tierPrices = { 1: '0.10', 2: '0.20', 3: '0.30' };
  const piecePrices = {
    motherboard: { 1: '0.02', 2: '0.04', 3: '0.06' },
    cpu: { 1: '0.03', 2: '0.06', 3: '0.09' },
    gpu: { 1: '0.05', 2: '0.10', 3: '0.15' },
  };
  const specialCpuData = {
    A: { price: '0.10', gain: '1.300', tier: 1, image: '/special_a.png' },
    B: { price: '0.20', gain: '1.500', tier: 2, image: '/special_b.png' },
    C: { price: '0.30', gain: '1.800', tier: 3, image: '/special_c.png' },
  };

  // --- Effects for State Management ---
  useEffect(() => {
    setCoinBdg(mined);
    localStorage.setItem('cryptoDesktopMined_v2', mined);
  }, [mined, setCoinBdg]);

  useEffect(() => {
    localStorage.setItem('cryptoDesktopSlots_v2', JSON.stringify(slots));
  }, [slots]);

  // ... (other useEffects)

  // --- Core Game Functions ---
  const addNewSlot = () => {
    if (slots.length < MAX_SLOTS) {
      const newSlot = {
        name: `CPU ${slots.length + 1}`,
        filled: false,
        free: false,
        tier: 1,
        purchaseMode: 'standard'
      };
      setSlots(prevSlots => [...prevSlots, newSlot]);
      setStatus('Novo gabinete adicionado!');
    } else {
      setStatus('Você atingiu o número máximo de gabinetes.');
    }
  };

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
  
  function handleMountFree(idx) {
    setSlots((prev) => prev.map((slot, i) => (i === idx ? { ...slot, filled: true, type: 'standard', tier: 1 } : slot)));
    setStatus(`CPU Grátis montado!`);
  }

  // ... (other functions)

  const setPurchaseMode = (idx, mode) => {
    setSlots(prev => prev.map((s, i) => i === idx ? { ...s, purchaseMode: mode } : s));
  };

  // --- JSX Render --- 
  return (
    <div>
      {/* ... (seções de mineração, boost, etc.) */}

      <div style={{ textAlign: 'center', margin: '24px 0' }}>
        <button onClick={addNewSlot} disabled={slots.length >= MAX_SLOTS} style={{ padding: '12px 20px', fontSize: '1em', cursor: 'pointer', background: '#1f4068', color: 'white', border: 'none', borderRadius: '8px' }}>
          Comprar Novo Gabinete ({slots.length}/{MAX_SLOTS})
        </button>
      </div>

      <div style={{ marginTop: 24 }}>
        <h3 style={{ textAlign: 'center' }}>Sua Sala de Mineração</h3>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
          {slots.map((slot, idx) => {
            let imageUrl = '';
            if (slot.filled) {
              if (slot.type === 'standard') {
                imageUrl = `/tier${slot.tier || 1}.png`;
              } else { // special
                const specialKey = Object.keys(specialCpuData).find(k => specialCpuData[k].tier === slot.tier);
                imageUrl = specialCpuData[specialKey]?.image || '';
              }
            }

            return (
              <div key={idx} style={{ border: '2px dashed #aaa', borderRadius: 8, padding: '12px', width: 220, minHeight: 250, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', background: slot.filled ? '#2a2a3e' : '#162447' }}>
                <div style={{ fontWeight: 'bold', marginBottom: 8 }}>{slot.name}</div>

                {slot.filled ? (
                  <div style={{ textAlign: 'center' }}>
                    <img src={imageUrl} alt={slot.type} style={{ width: '100px', height: '100px', objectFit: 'contain' }} />
                    <p style={{ margin: '8px 0 0 0', fontWeight: 'bold' }}>{slot.type === 'standard' ? `Padrão Tier ${slot.tier}` : `Especial CPU ${Object.keys(specialCpuData).find(k => specialCpuData[k].tier === slot.tier)}`}</p>
                  </div>
                ) : slot.free ? (
                   <button style={{ fontSize: '0.9em' }} onClick={() => handleMountFree(idx)}>Montar grátis</button>
                ) : (
                  <>
                    <div style={{ display: 'flex', width: '100%', marginBottom: '12px' }}>
                      <button onClick={() => setPurchaseMode(idx, 'standard')} style={{ flex: 1, padding: '4px', border: slot.purchaseMode === 'standard' ? '2px solid #007bff' : '1px solid #ccc', background: '#f0f2f5' }}>Padrão</button>
                      <button onClick={() => setPurchaseMode(idx, 'special')} style={{ flex: 1, padding: '4px', border: slot.purchaseMode === 'special' ? '2px solid #007bff' : '1px solid #ccc', background: '#f0f2f5' }}>Especial</button>
                    </div>

                    {slot.purchaseMode === 'standard' ? (
                      <div style={{ textAlign: 'center' }}>
                        <label>Tier:</label>
                        <select value={slot.tier} onChange={e => setSlots(prev => prev.map((s, i) => i === idx ? { ...s, tier: Number(e.target.value) } : s))}>
                          <option value={1}>Tier 1</option>
                          <option value={2}>Tier 2</option>
                          <option value={3}>Tier 3</option>
                        </select>
                        <p style={{ fontWeight: 'bold', marginTop: '8px' }}>Total: {tierPrices[slot.tier]} BNB</p>
                        <button onClick={() => handleBuy(idx, slot.tier, 'standard')}>Comprar Componentes</button>
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center' }}>
                        <label>CPU Especial:</label>
                        <select value={slot.tier} onChange={e => setSlots(prev => prev.map((s, i) => i === idx ? { ...s, tier: Number(e.target.value) } : s))}>
                          <option value={1}>CPU A</option>
                          <option value={2}>CPU B</option>
                          <option value={3}>CPU C</option>
                        </select>
                        <p style={{ fontWeight: 'bold', marginTop: '8px' }}>Preço: {specialCpuData[Object.keys(specialCpuData).find(k => specialCpuData[k].tier === slot.tier)].price} BNB</p>
                        <button onClick={() => handleBuy(idx, slot.tier, 'special')}>Comprar CPU Especial</button>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

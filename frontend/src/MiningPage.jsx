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
  const [slots, setSlots] = useState([
    { name: 'CPU 1 (Grátis)', filled: false, free: true },
    { name: 'CPU 2 (Grátis)', filled: false, free: true },
    { name: 'CPU 3', filled: false, free: false, tier: 1 },
    { name: 'CPU 4', filled: false, free: false, tier: 1 },
    { name: 'CPU 5', filled: false, free: false, tier: 1 },
    { name: 'CPU 6', filled: false, free: false, tier: 1 },
  ]);

  const monthlyBDG = {
    free: '200',
    1: '400–500',
    2: '800–1000',
    3: '1400–1600',
  };
  const piecePrices = {
    motherboard: { 1: '0.005', 2: '0.010', 3: '0.020' },
    cpu: { 1: '0.010', 2: '0.030', 3: '0.050' },
    gpu: { 1: '0.020', 2: '0.050', 3: '0.100' },
  };
  const tierPrices = {
    1: '0.035', // Básico
    2: '0.090', // Intermediário
    3: '0.170', // Avançado
  };

  // Pass mined (Coin BDG) balance up to the App component
  useEffect(() => {
    setCoinBdg(mined);
  }, [mined, setCoinBdg]);

  // Effect for initializing and resetting ad sessions daily
  useEffect(() => {
    const today = getTodayString();
    const savedDate = localStorage.getItem('lastAdSessionDate_v2') || '';
    const savedSessions = localStorage.getItem('adSessionsLeft_v2');

    if (savedDate !== today) {
      setAdSessionsLeft(3);
      localStorage.setItem('adSessionsLeft_v2', '3');
      localStorage.setItem('lastAdSessionDate_v2', today);
      setLastAdSessionDate(today);
    } else {
      if (savedSessions !== null) {
        setAdSessionsLeft(Number(savedSessions));
      }
    }
  }, []);

  // Effect to save boost time to localStorage
  useEffect(() => {
    localStorage.setItem('adBoostTime_v2', adBoostTime);
  }, [adBoostTime]);

  // Main game loop for timers and boost
  useEffect(() => {
    const interval = setInterval(() => {
      let isBoostActive = false;
      setAdBoostTime(prev => {
        if (prev > 0) {
          isBoostActive = true;
          return prev - 1;
        }
        return 0;
      });

      if (isBoostActive) {
        return;
      }

      setSlotTimers((prev) => prev.map((t, i) => (needsRepair[i] || slotEnergy[i] <= 0 ? t : t > 0 ? t - 1 : 0)));
      setSlotEnergy((prev) => prev.map((e, i) => (needsRepair[i] || e <= 0 || slotTimers[i] <= 0 ? e : e - 1)));
      setNeedsRepair((prev) => prev.map((r, i) => slotEnergy[i] <= 0 || slotTimers[i] <= 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [slotEnergy, slotTimers, needsRepair]); // Dependency array is correct

  function handleRepairSlot(idx) {
    setSlotEnergy((prev) => prev.map((e, i) => (i === idx ? MAX_ENERGY : e)));
    setSlotTimers((prev) => prev.map((t, i) => (i === idx ? REPAIR_TIME : t)));
    setNeedsRepair((prev) => prev.map((r, i) => (i === idx ? false : r)));
    setStatus(`Slot ${idx + 1} reparado! (-${REPAIR_COST} Coin BDG)`);
  }

  function handleAdSessionClick() {
    if (adSessionsLeft > 0 && adBoostTime <= 0) {
      const BOOST_DURATION = 3600; // 60 minutes
      setAdBoostTime(BOOST_DURATION);

      const newSessionsLeft = adSessionsLeft - 1;
      setAdSessionsLeft(newSessionsLeft);
      localStorage.setItem('adSessionsLeft_v2', newSessionsLeft);
      
      const today = getTodayString();
      setLastAdSessionDate(today);
      localStorage.setItem('lastAdSessionDate_v2', today);

      setStatus(`Boost de 60 minutos ativado! Sessões restantes hoje: ${newSessionsLeft}`);
    }
  }

  // Simula mineração automática
  useEffect(() => {
    const timer = setInterval(() => {
      setMiningCount((c) => c + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  function handleMountFree(idx) {
    setSlots((prev) => prev.map((slot, i) => (i === idx ? { ...slot, filled: true } : slot)));
    setStatus(`CPU ${idx + 1} montado gratuitamente com Coin BDG!`);
  }

  async function handleBuyBNB(idx) {
    try {
      setStatus('Conectando carteira...');
      const { signer } = await connectWallet();
      const slot = slots[idx];
      const tier = slot.tier || 1;
      const price = tierPrices[tier];
      const shop = new ethers.Contract('0xeD266DC6Fd8b5124eec783c58BB351E0Bc3C7d59', ['function buyWithBNB(uint256,address) external payable'], signer);
      setStatus(`Enviando BNB (Tier ${tier})...`);
      const value = ethers.utils.parseEther(price);
      const tx = await shop.buyWithBNB(idx, ethers.constants.AddressZero, { value });
      await tx.wait();
      setSlots((prev) => prev.map((slot, i) => (i === idx ? { ...slot, filled: true } : slot)));
      setStatus(`CPU ${idx + 1} comprado com BNB! (Tier ${tier})`);
    } catch (e) {
      setStatus('Erro ao comprar com BNB: ' + (e.message || e));
    }
  }

  function doMine() {
    setMined((m) => m + 1);
  }

  async function claim() {
    if (!window.ethereum) return setStatus('MetaMask não detectado');
    try {
      setStatus('Enviando requisição para o servidor...');
      const { address } = await connectWallet();
      const response = await fetch('/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, amount: mined }),
      });
      const data = await response.json();
      if (response.ok) {
        setStatus(`Reivindicado: ${mined} BDG`);
        setMined(0);
      } else {
        setStatus('Erro: ' + data.message);
      }
    } catch (e) {
      setStatus('Erro: ' + (e.message || e));
    }
  }

  return (
    <div>
      {/* Mining Simulation Section */}
      <div style={{ marginBottom: 24, textAlign: 'center' }}>
        <div style={{ fontSize: '1.2em', marginBottom: 8 }}>
          Minerando... <span style={{ fontWeight: 'bold', color: '#2a7' }}>{miningCount}</span> hashes
        </div>
        <button onClick={doMine} style={{ padding: '10px 20px', fontSize: '1em' }}>Minerar (simular)</button>
        <button onClick={claim} disabled={mined === 0} style={{ padding: '10px 20px', fontSize: '1em', marginLeft: '10px' }}>Reivindicar</button>
      </div>

      {/* Ad Boost Section */}
      <div style={{ marginBottom: 24, padding: 12, border: '1px solid #4CAF50', borderRadius: 8, background: '#e8f5e9', maxWidth: 420, margin: '0 auto' }}>
        <h4 style={{ color: '#4CAF50', marginBottom: 8, textAlign: 'center' }}>Boost de Anúncio</h4>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1em', marginBottom: 8 }}>
            Tempo de Boost restante: <span style={{ fontWeight: 'bold' }}>{Math.floor(adBoostTime / 60)}:{(adBoostTime % 60).toString().padStart(2, '0')}</span>
          </div>
          <div style={{ fontSize: '1em', marginBottom: 8 }}>
            Sessões de anúncio hoje: <span style={{ fontWeight: 'bold' }}>{adSessionsLeft} / 3</span>
          </div>
          <button
            onClick={handleAdSessionClick}
            disabled={adSessionsLeft <= 0 || adBoostTime > 0}
            style={{
              fontSize: '0.95em',
              background: (adSessionsLeft <= 0 || adBoostTime > 0) ? '#ccc' : '#4CAF50',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: (adSessionsLeft <= 0 || adBoostTime > 0) ? 'not-allowed' : 'pointer',
            }}
          >
            Ativar 60 min de Boost
          </button>
          <div style={{ fontSize: '0.9em', color: '#555', marginTop: 8 }}>
            Durante o boost, seus slots não consomem energia ou tempo de uso.
          </div>
        </div>
      </div>

      {/* Computer Slots Section */}
      <div style={{ marginTop: 24 }}>
        <h3 style={{ textAlign: 'center' }}>Monte seu computador para minerar</h3>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
          {slots.map((slot, idx) => (
            <div key={idx} style={{ border: '2px dashed #aaa', borderRadius: 8, width: 170, height: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: slot.filled ? '#e0ffe0' : '#fff', position: 'relative' }}>
              <div style={{ fontWeight: 'bold', marginBottom: 8 }}>{slot.name}</div>
              <div style={{ width: '90%', height: 18, background: '#eee', borderRadius: 8, marginBottom: 6, position: 'relative', boxShadow: slotEnergy[idx] < 30 ? '0 0 8px 2px #e22' : '0 0 4px 1px #2a7', transition: 'box-shadow 0.3s' }}>
                <div style={{ width: `${slotEnergy[idx]}%`, height: '100%', background: slotEnergy[idx] > 30 ? 'linear-gradient(90deg,#2a7,#7fffd4)' : 'linear-gradient(90deg,#e22,#ffb6b6)', borderRadius: 8, transition: 'width 0.5s' }}></div>
                <span style={{ position: 'absolute', left: '50%', top: 0, transform: 'translateX(-50%)', fontSize: '0.9em', color: slotEnergy[idx] < 30 ? '#e22' : '#222', fontWeight: slotEnergy[idx] < 30 ? 'bold' : 'normal', textShadow: slotEnergy[idx] < 30 ? '0 0 2px #fff' : 'none' }}>{slotEnergy[idx]}%</span>
              </div>
              <div style={{ fontSize: '0.9em', marginBottom: 6 }}>Tempo restante: {slotTimers[idx]}s</div>
              {needsRepair[idx] && <div style={{ color: '#e22', fontWeight: 'bold', marginBottom: 6 }}>Precisa de reparo!</div>}
              {!slot.free && !slot.filled && (
                <>
                  <div style={{ marginBottom: 8 }}>
                    <label htmlFor={`tier-select-${idx}`}>Tier:</label>
                    <select
                      id={`tier-select-${idx}`}
                      value={slot.tier}
                      onChange={e => {
                        const newTier = Number(e.target.value);
                        setSlots(prev => prev.map((s, i) => (i === idx ? { ...s, tier: newTier } : s)));
                      }}
                      style={{ marginLeft: 4 }}
                    >
                      <option value={1}>Básico</option>
                      <option value={2}>Intermediário</option>
                      <option value={3}>Avançado</option>
                    </select>
                  </div>
                  <div style={{ fontSize: '0.9em', marginBottom: 8, textAlign: 'left' }}>
                    <div>Placa-mãe: {piecePrices.motherboard[slot.tier || 1]} BNB</div>
                    <div>Processador: {piecePrices.cpu[slot.tier || 1]} BNB</div>
                    <div>Placa de vídeo: {piecePrices.gpu[slot.tier || 1]} BNB</div>
                    <div style={{ fontWeight: 'bold', marginTop: 4 }}>Total: {tierPrices[slot.tier || 1]} BNB</div>
                    <div style={{ marginTop: 6, color: '#2a7' }}>Ganhos mensais: {monthlyBDG[slot.tier || 1]} BDG</div>
                  </div>
                </>
              )}
              {slot.filled ? (
                <span style={{ color: 'green' }}>Montado</span>
              ) : slot.free ? (
                <>
                  <button style={{ fontSize: '0.9em' }} onClick={() => handleMountFree(idx)}>Montar grátis (Coin BDG)</button>
                  <div style={{ marginTop: 8, color: '#2a7', fontSize: '0.9em' }}>Ganhos mensais: {monthlyBDG.free} BDG</div>
                </>
              ) : (
                <button style={{ fontSize: '0.9em' }} onClick={() => handleBuyBNB(idx)}>Comprar com BNB</button>
              )}
              {needsRepair[idx] && (
                <button
                  style={{ fontSize: '0.9em', marginTop: 8, background: '#e22', color: '#fff', boxShadow: '0 0 8px 2px #e22', border: 'none', borderRadius: 6, padding: '6px 16px', cursor: 'pointer', transition: 'transform 0.1s' }}
                  onClick={e => {
                    e.target.style.transform = 'scale(0.95)';
                    setTimeout(() => { e.target.style.transform = 'scale(1)'; }, 120);
                    handleRepairSlot(idx);
                  }}
                >
                  Reparar (-{REPAIR_COST} Coin BDG)
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
      {status && <div style={{ marginTop: 24, padding: 12, color: 'green', textAlign: 'center', border: '1px solid green', borderRadius: '8px' }}>{status}</div>}
    </div>
  );
}

import React from 'react';
import AdComponent from './AdComponent'; // Importa o novo componente de anúncio

// A constante economyData é recebida via props, não importada.

const specialCpuMap = { 1: 'A', 2: 'B', 3: 'C' };
const PAID_BOOST_COST = 80;
const PAID_BOOST_DURATION = 1800; 
const AD_BOOST_DURATION = 1200; 
const TWENTY_FOUR_HOURS_IN_SECONDS = 24 * 60 * 60;

const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
};

export default function MiningPage({ 
  coinBdg, setCoinBdg, slots, setSlots, addNewSlot, setStatus,
  adBoostTime, paidBoostTime, setPaidBoostTime, adSessionsLeft, setAdSessionsLeft,
  setLastAdSessionDate, economyData
}) {

  const handleMountFree = (idx) => {
    setSlots(prev => prev.map((s, i) => (i === idx ? { ...s, filled: true, repairCooldown: TWENTY_FOUR_HOURS_IN_SECONDS } : s)));
    setStatus('✅ CPU Grátis montado e pronto para minerar!');
  };

  const handleRepairSlot = (idx) => {
    const slotToRepair = slots[idx];
    const econKey = slotToRepair.type === 'free' ? 'free' : (slotToRepair.type === 'standard' ? slotToRepair.tier : Object.keys(economyData).find(k => economyData[k].tier === slotToRepair.tier && k.length === 1));
    const repairCost = economyData[econKey]?.repairCost || 0;

    if (coinBdg >= repairCost) {
      setCoinBdg(prev => prev - repairCost);
      setSlots(prevSlots => prevSlots.map((slot, i) => {
          if (i === idx) {
              return { ...slot, repairCooldown: TWENTY_FOUR_HOURS_IN_SECONDS, isBroken: false };
          }
          return slot;
      }));
      setStatus(`✅ Slot reparado! (-${repairCost} Coin BDG)`);
    } else {
        setStatus(`❌ Moedas insuficientes para o reparo!`);
    }
  };

  const handleBuyEnergy = (idx) => {
      const slotToRefill = slots[idx];
      if (!slotToRefill.filled || slotToRefill.isBroken) return;
      
      const econKey = slotToRefill.type === 'free' ? 'free' : (slotToRefill.type === 'standard' ? slotToRefill.tier : Object.keys(economyData).find(k => economyData[k].tier === slotToRefill.tier && k.length === 1));
      const energyCost = economyData[econKey]?.energyCost;

      if (coinBdg >= energyCost) {
          setCoinBdg(prev => prev - energyCost);
          setSlots(prevSlots => prevSlots.map((slot, i) => {
              if (i === idx) {
                  const newTimer = Math.min(slot.repairCooldown + 3600, TWENTY_FOUR_HOURS_IN_SECONDS);
                  return { ...slot, repairCooldown: newTimer };
              }
              return slot;
          }));
          setStatus(`✅ +1 hora de mineração comprada para o Slot ${idx + 1}!`);
      } else {
          setStatus('❌ Moedas insuficientes para comprar energia.');
      }
  };

  const handleBuyPaidBoost = () => {
    // ... (lógica do boost pago)
  };

  const handleAdSessionClick = () => {
    // ... (lógica do boost de anúncio)
  };

  return (
    <div>
      {/* Adicionado o componente de anúncio aqui */}
      <AdComponent />

      {/* Seção de Boosts */}
      <div style={{ /* ... */ }}>
        {/* ... */}
      </div>

      {/* O resto da página continua igual... */}
    </div>
  );
}

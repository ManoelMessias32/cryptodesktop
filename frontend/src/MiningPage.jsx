import React from 'react';

// A constante economyData é recebida via props, não importada.

const specialCpuMap = { 1: 'A', 2: 'B', 3: 'C' };
const PAID_BOOST_COST = 80;
const PAID_BOOST_DURATION = 1800; // 30 minutos
const AD_BOOST_DURATION = 1200; // 20 minutos
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
  setLastAdSessionDate, economyData // Recebendo economyData como prop
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
    if (coinBdg >= PAID_BOOST_COST) {
      if (paidBoostTime > 0) {
        setStatus('Um boost pago já está ativo.');
        return;
      }
      setCoinBdg(prev => prev - PAID_BOOST_COST);
      setPaidBoostTime(PAID_BOOST_DURATION);
      setStatus(`✅ Boost de 30 minutos ativado!`);
    } else {
      setStatus('❌ Moedas insuficientes para ativar o boost.');
    }
  };

  const handleAdSessionClick = () => {
    if (adSessionsLeft > 0 && adBoostTime <= 0) {
        setAdBoostTime(prev => prev + AD_BOOST_DURATION);
        const newSessionsLeft = adSessionsLeft - 1;
        setAdSessionsLeft(newSessionsLeft);
        localStorage.setItem('adSessionsLeft_v6', newSessionsLeft.toString());
        const today = new Date().toISOString().split('T')[0];
        setLastAdSessionDate(today);
        localStorage.setItem('lastAdSessionDate_v6', today);
        setStatus(`✅ Boost de 20 minutos ativado! Anúncios restantes hoje: ${newSessionsLeft}`);
    }
  };

  return (
    <div>
      {/* O JSX renderiza aqui... */}
    </div>
  );
}

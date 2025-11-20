import React from 'react';

const specialCpuMap = { 1: 'A', 2: 'B', 3: 'C' };
const PAID_BOOST_COST = 80;
const PAID_BOOST_DURATION = 1800; 
const TWENTY_FOUR_HOURS_IN_SECONDS = 24 * 60 * 60;
const ENERGY_REFILL_ALL_COST = 50;

const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
};

export default function MiningPage({ 
  coinBdg, setCoinBdg, slots, setSlots, addNewSlot, setStatus,
  paidBoostTime, setPaidBoostTime, economyData 
}) {

  const handleMountFree = (idx) => {
    setSlots(prev => prev.map((s, i) => (i === idx ? { ...s, filled: true, type: 'free', repairCooldown: TWENTY_FOUR_HOURS_IN_SECONDS } : s)));
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

  const handleBuyEnergyForAll = () => {
    if (coinBdg >= ENERGY_REFILL_ALL_COST) {
      setCoinBdg(prev => prev - ENERGY_REFILL_ALL_COST);
      setSlots(prevSlots => prevSlots.map(slot => {
        if (slot.filled && !slot.isBroken) {
          return { ...slot, repairCooldown: TWENTY_FOUR_HOURS_IN_SECONDS };
        }
        return slot;
      }));
      setStatus(`✅ Energia de todos os slots reabastecida!`);
    } else {
      setStatus(`❌ Moedas insuficientes! Custo: ${ENERGY_REFILL_ALL_COST} BDG`);
    }
  };

  const buttonStyle = { background: '#6366f1', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', width: '100%' };

  return (
    <div>
      <div style={{ textAlign: 'center', margin: '0 0 20px 0' }}>
        <h2 style={{ fontSize: '1.8em', margin: 0, color: '#facc15' }}>🪙 {coinBdg.toFixed(2)} BDG</h2>
        <p style={{ margin: '5px 0', color: '#a1a1aa' }}>Sua moeda para usar no jogo</p>
      </div>

      {/* --- SEÇÃO DE RECARGA SIMPLIFICADA --- */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', margin: '24px auto' }}>
        <button onClick={handleBuyEnergyForAll} style={{...buttonStyle, width: 'auto', padding: '10px 15px'}}>
          Reabastecer Tudo ({ENERGY_REFILL_ALL_COST} BDG)
        </button>
        <button onClick={handleBuyPaidBoost} disabled={coinBdg < PAID_BOOST_COST || paidBoostTime > 0} style={{...buttonStyle, width: 'auto', padding: '10px 15px'}}>
          Ativar Boost (+30 min) ({PAID_BOOST_COST} BDG)
        </button>
      </div>

       <div style={{textAlign: 'center', marginTop: '12px', minHeight: '20px'}}>
        {paidBoostTime > 0 && <p>Boost Pago: {formatTime(paidBoostTime)}</p>}
      </div>

      <div style={{ textAlign: 'center', margin: '24px 0' }}>
        <button onClick={addNewSlot} disabled={slots.length >= 6} style={buttonStyle}>Comprar Novo Gabinete ({slots.length}/6)</button>
      </div>

      <div style={{ marginTop: 24 }}>
        <h3 style={{ textAlign: 'center', color: '#e4e4e7' }}>Sua Sala de Mineração</h3>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '20px' }}>
          {slots.map((slot, idx) => {
            let imageUrl = '';
            let title = 'Gabinete Vazio';
            if (slot.filled) {
              const tier = slot.tier || 1;
              if (slot.type === 'free') {
                  imageUrl = '/tier1.png';
                  title = 'CPU Grátis';
              } else if (slot.type === 'standard') {
                  imageUrl = `/tier${tier}.png`;
                  title = `Padrão Tier ${tier}`;
              } else { 
                  const specialKey = specialCpuMap[tier];
                  imageUrl = `/special_${specialKey?.toLowerCase()}.png`;
                  title = `Especial CPU ${specialKey}`;
              }
            }

            return (
              <div key={idx} style={{ border: '1px solid #3f3f46', borderRadius: '8px', padding: '10px', width: '140px', height: '240px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-around', background: '#27272a' }}>
                <div style={{ fontWeight: 'bold', fontSize: '0.9em', color: '#a1a1aa' }}>{slot.name}</div>
                {slot.filled ? (
                  <div style={{ textAlign: 'center' }}>
                    <img src={imageUrl} alt={title} style={{ width: '60px', height: '60px', objectFit: 'contain', margin: '10px 0' }} />
                    <p style={{ margin: '8px 0', fontWeight: 'bold' }}>{title}</p>
                    {slot.isBroken ? (
                        <button onClick={() => handleRepairSlot(idx)} style={{...buttonStyle, background:'#ef4444'}}>Reparar</button>
                    ) : (
                      <div>
                        <p style={{fontSize: '0.8em'}}>Tempo: {formatTime(slot.repairCooldown)}</p>
                        <button onClick={() => handleBuyEnergy(idx)} style={{...buttonStyle, padding: '6px 10px', fontSize: '0.9em'}}>+1h Energia</button>
                      </div>
                    )}
                  </div>
                ) : slot.free ? (
                  <button onClick={() => handleMountFree(idx)} style={buttonStyle}>Montar CPU Grátis</button>
                ) : (
                  <p style={{ color: '#a1a1aa' }}>{title}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

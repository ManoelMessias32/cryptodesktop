import React from 'react';
// import AdComponent from './AdComponent';

// A constante economyData é recebida via props, NÃO importada.

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
  adBoostTime, paidBoostTime, setPaidBoostTime, adSessionsLeft, handleAdSessionClick, economyData 
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

  return (
    <div>
      {/* <AdComponent /> */}

      <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', marginTop: 24, padding: 12, border: '1px solid #007bff', borderRadius: 8, background: '#2a2a3e', maxWidth: 600, margin: '24px auto' }}>
        <div>
            <h4>Boost de Anúncio</h4>
            <button onClick={handleAdSessionClick} disabled={adSessionsLeft <= 0 || adBoostTime > 0}>Usar Anúncio (+20 min)</button>
            <p style={{textAlign: 'center'}}>{adSessionsLeft}/3 restantes</p>
        </div>
        <div>
            <h4>Boost Pago</h4>
            <button onClick={handleBuyPaidBoost} disabled={coinBdg < PAID_BOOST_COST || paidBoostTime > 0}>Ativar (+30 min)</button>
            <p style={{textAlign: 'center'}}>Custo: {PAID_BOOST_COST} Coin BDG</p>
        </div>
      </div>

       <div style={{textAlign: 'center', marginTop: '12px', minHeight: '40px'}}>
        {adBoostTime > 0 && <p>Boost de Anúncio: {formatTime(adBoostTime)}</p>}
        {paidBoostTime > 0 && <p>Boost Pago: {formatTime(paidBoostTime)}</p>}
      </div>

      <div style={{ textAlign: 'center', margin: '24px 0' }}>
        <button onClick={addNewSlot} disabled={slots.length >= 6}>Comprar Novo Gabinete ({slots.length}/6)</button>
      </div>

      <div style={{ marginTop: 24 }}>
        <h3 style={{ textAlign: 'center' }}>Sua Sala de Mineração</h3>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
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
              <div key={idx} style={{ border: '2px dashed #aaa', borderRadius: '16px', padding: '10px', width: '180px', height: '280px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-around', background: '#162447' }}>
                <div style={{ fontWeight: 'bold', height: '20px' }}>{slot.name}</div>
                {slot.filled ? (
                  <div style={{ textAlign: 'center' }}>
                    <img src={imageUrl} alt={title} style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
                    <p style={{ margin: '8px 0', fontWeight: 'bold' }}>{title}</p>
                    {slot.isBroken ? (
                        <button onClick={() => handleRepairSlot(idx)} style={{marginTop: '8px', background:'#f44336', color:'white'}}>Reparar</button>
                    ) : (
                      <div>
                        <p style={{fontSize: '0.9em'}}>Tempo Restante: {formatTime(slot.repairCooldown)}</p>
                        <button onClick={() => handleBuyEnergy(idx)}>+1h de Energia</button>
                      </div>
                    )}
                  </div>
                ) : slot.free ? (
                  <button onClick={() => handleMountFree(idx)}>Montar CPU Grátis</button>
                ) : (
                  <p style={{ color: '#888' }}>{title}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

import React from 'react';

const ENERGY_REFILL_COST = 20;
const PAID_BOOST_COST = 80;
const PAID_BOOST_DURATION = 1800; // 30 minutos
const specialCpuMap = { 1: 'A', 2: 'B', 3: 'C' };

export default function MiningPage({ 
  coinBdg, setCoinBdg, slots, setSlots, addNewSlot, setStatus, 
  adBoostTime, paidBoostTime, setPaidBoostTime, MAX_ENERGY, REPAIR_TIME 
}) {

  const doMine = () => setCoinBdg(prev => prev + 1);

  const handleMountFree = (idx) => {
    setSlots(prev => prev.map((s, i) => (i === idx ? { ...s, filled: true } : s)));
    setStatus('✅ CPU Grátis montado e pronto para minerar!');
  };

  const handleBuyEnergy = () => {
    if (coinBdg >= ENERGY_REFILL_COST) {
      setCoinBdg(prev => prev - ENERGY_REFILL_COST);
      setSlots(prevSlots => prevSlots.map(slot => ({ ...slot, energy: MAX_ENERGY })));
      setStatus(`✅ Energia de todos os slots foi restaurada!`);
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

  const handleRepairSlot = (idx) => {
      setSlots(prevSlots => prevSlots.map((slot, i) => {
          if (i === idx) {
              return { ...slot, energy: MAX_ENERGY, timer: REPAIR_TIME, needsRepair: false };
          }
          return slot;
      }));
      setStatus(`✅ Slot ${idx + 1} reparado e pronto para minerar!`);
  };

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <button onClick={doMine} style={{ padding: '10px 20px', fontSize: '1em' }}>Simular Mineração</button>
      </div>

      <div style={{ marginTop: 24, padding: 12, border: '1px solid #ffc107', borderRadius: 8, background: '#2a2a3e', maxWidth: 420, margin: '24px auto' }}>
        <h4 style={{ color: '#ffc107', marginBottom: 16, textAlign: 'center' }}>Itens Consumíveis (Coin BDG)</h4>
        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
          <div>
            <button onClick={handleBuyEnergy} disabled={coinBdg < ENERGY_REFILL_COST}>Comprar Energia</button>
            <p style={{fontSize: '0.8em', margin: '4px 0 0 0', textAlign: 'center' }}>Custo: {ENERGY_REFILL_COST} Coin BDG</p>
          </div>
          <div>
            <button onClick={handleBuyPaidBoost} disabled={coinBdg < PAID_BOOST_COST || paidBoostTime > 0}>Ativar Boost (30 min)</button>
            <p style={{fontSize: '0.8em', margin: '4px 0 0 0', textAlign: 'center' }}>Custo: {PAID_BOOST_COST} Coin BDG</p>
          </div>
        </div>
      </div>

      <div style={{textAlign: 'center', marginTop: '12px', minHeight: '40px'}}>
        {adBoostTime > 0 && <p>Boost de Anúncio: {Math.floor(adBoostTime / 60)}:{(adBoostTime % 60).toString().padStart(2, '0')}</p>}
        {paidBoostTime > 0 && <p>Boost Pago: {Math.floor(paidBoostTime / 60)}:{(paidBoostTime % 60).toString().padStart(2, '0')}</p>}
      </div>

      <div style={{ textAlign: 'center', margin: '24px 0' }}>
        <button onClick={addNewSlot} disabled={slots.length >= 6} style={{ padding: '12px 20px', fontSize: '1em'}}>
          Comprar Novo Gabinete ({slots.length}/6)
        </button>
      </div>

      <div style={{ marginTop: 24 }}>
        <h3 style={{ textAlign: 'center' }}>Sua Sala de Mineração</h3>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
          {slots.map((slot, idx) => {
            let imageUrl = '';
            let title = 'Gabinete Vazio';

            if (slot.filled) {
              if (slot.type === 'free') { imageUrl = '/tier1.png'; title = 'CPU Grátis'; }
              else if (slot.type === 'standard') { imageUrl = `/tier${slot.tier}.png`; title = `Padrão Tier ${slot.tier}`; }
              else { const key = specialCpuMap[slot.tier]; imageUrl = `/special_${key.toLowerCase()}.png`; title = `Especial CPU ${key}`; }
            }

            return (
              <div key={idx} style={{ border: '2px dashed #aaa', borderRadius: 8, padding: '12px', width: 220, height: 280, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-around', background: '#162447' }}>
                <div style={{ fontWeight: 'bold', height: '20px' }}>{slot.name}</div>
                {slot.filled ? (
                  <div style={{ textAlign: 'center' }}>
                    <img src={imageUrl} alt={title} style={{ width: '100px', height: '100px', objectFit: 'contain' }} />
                    <p style={{ margin: '8px 0', fontWeight: 'bold' }}>{title}</p>
                    <div style={{width: '90%', height: 18, background: '#1a1a2e', borderRadius: 8}}>
                       <div style={{ width: `${slot.energy || 0}%`, height: '100%', background: slot.energy > 30 ? '#4CAF50' : '#f44336', borderRadius: 8 }}></div>
                    </div>
                    <p style={{fontSize: '0.8em'}}>Energia: {slot.energy || 0}% | Reparo em: {slot.timer}s</p>
                    {slot.needsRepair && <button onClick={() => handleRepairSlot(idx)} style={{marginTop: '8px', background:'#f44336', color:'white'}}>Reparar</button>}
                  </div>
                ) : slot.free ? (
                  <button style={{ fontSize: '1em', padding: '10px' }} onClick={() => handleMountFree(idx)}>Montar CPU Grátis</button>
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

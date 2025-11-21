import React from 'react';

const TWENTY_FOUR_HOURS_IN_SECONDS = 24 * 60 * 60;
const ENERGY_REFILL_ALL_COST = 50;
const PAID_BOOST_COST = 80;

const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
};

const EnergyBar = ({ currentTime, maxTime }) => {
  const percentage = (currentTime / maxTime) * 100;
  return (
    <div style={{ width: '100%', backgroundColor: '#4a5568', borderRadius: '5px', overflow: 'hidden', height: '10px' }}>
      <div style={{ width: `${percentage}%`, backgroundColor: '#6366f1', height: '100%' }}></div>
    </div>
  );
};

export default function MiningPage({ 
  coinBdg, setCoinBdg, slots, setSlots, addNewSlot, setStatus, 
  paidBoostTime, setPaidBoostTime
}) {

  const handleMountFree = (idx) => {
    setSlots(prev => prev.map((s, i) => (i === idx ? { ...s, filled: true, type: 'free', repairCooldown: TWENTY_FOUR_HOURS_IN_SECONDS } : s)));
    setStatus('✅ CPU Grátis montado e pronto para minerar!');
  };

  const handleReactivateEnergy = (idx) => {
    setSlots(prevSlots => prevSlots.map((slot, i) => {
        if (i === idx) return { ...slot, repairCooldown: 3600 };
        return slot;
    }));
    setStatus(`✅ Energia do Slot ${idx + 1} reativada por 1 hora!`);
  };
  
  const handleBuyEnergyForAll = () => {
    if (coinBdg >= ENERGY_REFILL_ALL_COST) {
      setCoinBdg(prev => prev - ENERGY_REFILL_ALL_COST);
      setSlots(prevSlots => prevSlots.map(slot => slot.filled ? { ...slot, repairCooldown: TWENTY_FOUR_HOURS_IN_SECONDS } : slot));
      setStatus(`✅ Energia de todos os slots reabastecida!`);
    } else {
      setStatus(`❌ Moedas insuficientes! Custo: ${ENERGY_REFILL_ALL_COST} BDG`);
    }
  };

  const handleBuyPaidBoost = () => {
    if (coinBdg >= PAID_BOOST_COST) {
      if (paidBoostTime > 0) return setStatus('Um boost pago já está ativo.');
      setCoinBdg(prev => prev - PAID_BOOST_COST);
      setPaidBoostTime(1800);
      setStatus(`✅ Boost de 30 minutos ativado!`);
    } else {
      setStatus('❌ Moedas insuficientes para ativar o boost.');
    }
  };

  const buttonStyle = { background: '#6366f1', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', width: '100%', fontFamily: '"Press Start 2P", cursive', fontSize:'0.7em' };

  return (
    <div style={{padding: '0 10px 80px 10px'}}>
      {/* Contador com largura máxima */}
      <div style={{ textAlign: 'center', margin: '20px auto', padding: '20px', background: '#2d3748', borderRadius: '10px', maxWidth: '500px' }}>
        <p style={{ margin: 0, color: '#a1a1aa', fontFamily: '"Press Start 2P", cursive', fontSize: '0.8em'}}>Seu Saldo</p>
        <h2 style={{ fontSize: '1.8em', margin: '10px 0 0 0', color: '#facc15', fontFamily: '"Press Start 2P", cursive' }}>{coinBdg.toFixed(4)}</h2>
        <p style={{ margin: '5px 0', color: '#a1a1aa' }}>BDG</p>
      </div>

      {/* Botões de compra com BDG */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', margin: '24px auto' }}>
        <button onClick={handleBuyEnergyForAll} style={{...buttonStyle, width: 'auto', padding: '10px 15px'}}>
          Reabastecer Tudo ({ENERGY_REFILL_ALL_COST} BDG)
        </button>
        <button onClick={handleBuyPaidBoost} disabled={paidBoostTime > 0} style={{...buttonStyle, width: 'auto', padding: '10px 15px'}}>
          Ativar Boost ({PAID_BOOST_COST} BDG)
        </button>
      </div>
      <div style={{textAlign: 'center', minHeight: '20px'}}>
        {paidBoostTime > 0 && <p>Boost: {formatTime(paidBoostTime)}</p>}
      </div>

      <div style={{ textAlign: 'center', margin: '24px 0' }}>
        <button onClick={addNewSlot} disabled={slots.length >= 6} style={buttonStyle}>Comprar Gabinete ({slots.length}/6)</button>
      </div>

      <div style={{ marginTop: 24 }}>
        <h3 style={{ textAlign: 'center', color: '#e4e4e7', fontFamily: '"Press Start 2P", cursive', fontSize: '1em' }}>Sua Sala de Mineração</h3>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '20px' }}>
          {slots.map((slot, idx) => { /* ...lógica de renderização dos slots... */ })}
        </div>
      </div>
    </div>
  );
}

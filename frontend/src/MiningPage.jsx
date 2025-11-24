import React from 'react';

const ONE_HOUR_IN_SECONDS = 3600;
const SECONDS_IN_A_MONTH = 30 * 24 * 3600;
const ENERGY_REFILL_ALL_COST = 50;
const PAID_BOOST_COST = 80;

// ... (funções formatTime, formatTimeToMine, EnergyBar)

export default function MiningPage({ 
  coinBdg, setCoinBdg, slots, setSlots, addNewSlot, setStatus, 
  paidBoostTime, setPaidBoostTime, economyData
}) {

  // ... (todas as funções handle*)
  
  const handleBuyEnergyForAll = () => {
    if (coinBdg >= ENERGY_REFILL_ALL_COST) {
      setCoinBdg(coinBdg - ENERGY_REFILL_ALL_COST);
      const updatedSlots = slots.map(slot => ({
        ...slot,
        energy: slot.maxEnergy 
      }));
      setSlots(updatedSlots);
      setStatus("Energia de todos os slots foi reabastecida!");
    } else {
      setStatus("Você não tem moedas suficientes para reabastecer a energia de todos os slots.");
    }
  };

  const buttonStyle = { background: '#6366f1', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '6px', cursor: 'pointer', width: '100%', fontFamily: '"Press Start 2P", cursive', fontSize: '0.8em' };

  return (
    <div style={{padding: '0 10px 80px 10px'}}>
      {/* --- CONTADOR DE SALDO RESTAURADO --- */}
      <div style={{ textAlign: 'center', margin: '20px auto', padding: '20px', background: '#2d3748', borderRadius: '10px', maxWidth: '90vw' }}>
        <p style={{ margin: 0, color: '#a1a1aa', fontFamily: '"Press Start 2P", cursive', fontSize: '0.8em'}}>Seu Saldo</p>
        <h2 style={{ fontSize: '2em', margin: '10px 0 0 0', color: '#facc15', fontFamily: '"Press Start 2P", cursive' }}>{coinBdg.toFixed(4)}</h2>
        <p style={{ margin: '5px 0', color: '#a1a1aa' }}>BDG</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', margin: '24px auto', flexWrap: 'wrap' }}>
        <button onClick={handleBuyEnergyForAll} style={{...buttonStyle, width: 'auto'}}>
          Reabastecer Tudo ({ENERGY_REFILL_ALL_COST} BDG)
        </button>
        <button onClick={handleBuyPaidBoost} disabled={paidBoostTime > 0} style={{...buttonStyle, width: 'auto'}}>
          Ativar Boost ({PAID_BOOST_COST} BDG)
        </button>
      </div>
      <div style={{textAlign: 'center', minHeight: '20px'}}>{paidBoostTime > 0 && <p>Boost: {formatTime(paidBoostTime)}</p>}</div>

      <div style={{ textAlign: 'center', margin: '24px 0' }}>
        <button onClick={addNewSlot} disabled={slots.length >= 6} style={buttonStyle}>Comprar Gabinete ({slots.length}/6)</button>
      </div>

      <div style={{ marginTop: 24 }}>
        <h3 style={{ textAlign: 'center', color: '#e4e4e7', fontFamily: '"Press Start 2P", cursive', fontSize: '1em' }}>Sua Sala de Mineração</h3>
        {/* ... (resto do código para renderizar os slots) ... */}
      </div>
    </div>
  );
}

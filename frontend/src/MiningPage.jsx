import React from 'react';

const ONE_HOUR_IN_SECONDS = 3600;
const SECONDS_IN_A_MONTH = 30 * 24 * 3600;
const ENERGY_REFILL_ALL_COST = 50;
const PAID_BOOST_COST = 80;

const formatTime = (seconds) => {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${d > 0 ? `${d}d ` : ''}${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const EnergyBar = ({ current, max }) => {
    const percentage = max > 0 ? (current / max) * 100 : 0;
    return (
        <div style={{ background: '#4a5568', borderRadius: '5px', overflow: 'hidden', width: '100%', height: '8px' }}>
            <div style={{ width: `${percentage}%`, background: '#48bb78', height: '100%' }}></div>
        </div>
    );
};

export default function MiningPage({ 
  coinBdg, setCoinBdg, slots, setSlots, addNewSlot, setStatus, 
  paidBoostTime, setPaidBoostTime, economyData
}) {

  const handleBuyEnergyForAll = () => {
    if (coinBdg >= ENERGY_REFILL_ALL_COST) {
      setCoinBdg(coinBdg - ENERGY_REFILL_ALL_COST);
      const updatedSlots = slots.map(slot => {
        if (slot.filled) {
          return { ...slot, repairCooldown: ONE_HOUR_IN_SECONDS };
        }
        return slot;
      });
      setSlots(updatedSlots);
      setStatus("Energia de todos os slots foi reabastecida!");
    } else {
      setStatus("Você não tem moedas suficientes para reabastecer a energia de todos os slots.");
    }
  };

  const handleBuyPaidBoost = () => {
    if (coinBdg >= PAID_BOOST_COST) {
      setCoinBdg(coinBdg - PAID_BOOST_COST);
      setPaidBoostTime(SECONDS_IN_A_MONTH);
      setStatus("Boost ativado por um mês!");
    } else {
      setStatus("Você não tem moedas suficientes para ativar o boost.");
    }
  };
  
  const calculateTimeForOneBDG = (slot) => {
    if (!slot.filled || !economyData) return '';
    const econKey = slot.type === 'free' ? 'free' : (slot.type === 'special' ? slot.tier.toString().toUpperCase() : slot.tier);
    const gainPerHour = economyData[econKey]?.gainPerHour || 0;
    if (gainPerHour <= 0) return '';
    
    const hoursForOneBDG = 1 / gainPerHour;
    const h = Math.floor(hoursForOneBDG);
    const m = Math.floor((hoursForOneBDG * 60) % 60);

    return `1 BDG em ~${h}h ${m}min`;
  };

  const getImagePath = (slot) => {
    if (!slot.filled) return '';
    if (slot.type === 'free') return '/cpu gratis.png';
    if (slot.type === 'special') return `/especial_${slot.tier.toLowerCase()}.jpg`;
    return `/tier${slot.tier}.png`;
  };

  const buttonStyle = { background: '#6366f1', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '6px', cursor: 'pointer', fontFamily: '"Press Start 2P", cursive', fontSize: '0.8em' };

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

      <div style={{ textAlign: 'center', margin: '24px auto', maxWidth: '400px' }}>
        <button onClick={addNewSlot} disabled={slots.length >= 6} style={{...buttonStyle, width: '100%'}}>Comprar Gabinete ({slots.length}/6)</button>
      </div>

      <div style={{ marginTop: 24 }}>
        <h3 style={{ textAlign: 'center', color: '#e4e4e7', fontFamily: '"Press Start 2P", cursive', fontSize: '1em' }}>Sua Sala de Mineração</h3>
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '15px', padding: '20px 10px' }}>
          {slots.map((slot, index) => (
            <div key={index} style={{ background: '#2d3748', padding: '15px', borderRadius: '8px', border: `1px solid ${slot.filled ? '#4a5568' : '#6366f1'}`, width: '220px', textAlign: 'center' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#facc15', fontFamily: '"Press Start 2P", cursive', fontSize: '0.8em' }}>{slot.name}</h4>
              {slot.filled ? (
                <>
                  <img src={getImagePath(slot)} alt={`CPU ${slot.tier}`} style={{width: '70px', height: '70px', margin: '10px auto', objectFit: 'contain'}} />
                  <p style={{ margin: '10px 0', color: '#e4e4e7', fontSize: '0.9em' }}>CPU Grátis</p>
                  <p style={{ margin: '10px 0', color: '#a1a1aa', fontSize: '0.8em' }}>{calculateTimeForOneBDG(slot)}</p>
                  <p style={{ margin: '10px 0', color: '#a1a1aa' }}>|</p>
                  <p style={{ margin: '5px 0', color: '#e4e4e7', fontSize: '0.9em' }}>Energia: {formatTime(slot.repairCooldown)}</p>
                  <EnergyBar current={slot.repairCooldown} max={ONE_HOUR_IN_SECONDS} />
                </>
              ) : (
                <p style={{ color: '#a1a1aa', textAlign: 'center', margin: '20px 0', height: '190px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Vazio</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

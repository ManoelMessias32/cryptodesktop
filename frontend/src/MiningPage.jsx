import React, { useEffect, useMemo } from 'react';

// --- COMPONENTES DE UI ---

// Componente reutilizável para os anúncios da Adsterra
const AdsterraAd = ({ atOptions }) => {
  const adContainer = React.useRef(null);

  useEffect(() => {
    if (adContainer.current && !adContainer.current.hasChildNodes()) {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.innerHTML = `atOptions = ${JSON.stringify(atOptions)};`;

      const invokeScript = document.createElement('script');
      invokeScript.type = 'text/javascript';
      invokeScript.src = `//www.highperformanceformat.com/${atOptions.key}/invoke.js`;

      adContainer.current.appendChild(script);
      adContainer.current.appendChild(invokeScript);
    }
  }, [atOptions]);

  return <div ref={adContainer} style={{ textAlign: 'center', margin: '20px auto' }} />;
};


// Círculo de Progresso para Mineração
const MiningCircle = ({ balance, miningRate }) => {
  const size = 180;
  const strokeWidth = 12;
  const center = size / 2;
  const radius = center - strokeWidth;

  return (
    <div style={styles.miningCircleContainer}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={center} cy={center} r={radius} fill="none" stroke="#2d3748" strokeWidth={strokeWidth} />
        <circle cx={center} cy={center} r={radius} fill="none" stroke="#facc15" strokeWidth={strokeWidth} strokeLinecap="round" strokeDasharray={2 * Math.PI * radius} style={{ animation: 'spin 2s linear infinite' }} />
      </svg>
      <img src="/dog.png" alt="Mining Mascot" style={styles.dogImage} />
      <div style={styles.balanceDisplay}>
        <h2 style={styles.balanceText}>{balance.toFixed(4)}</h2>
        <p style={styles.balanceLabel}>Token Coin</p>
        <p style={styles.miningRateText}>+{miningRate.toFixed(4)}/h</p>
      </div>
    </div>
  );
};

// Banner de Anúncio da Pré-Venda
const PreSaleBanner = ({ onNavigate }) => (
  <div style={styles.bannerContainer}>
    <h3 style={styles.bannerTitle}>Pré-Venda BDG Aberta!</h3>
    <p style={styles.bannerText}>Garanta seus tokens com bônus exclusivos. Não perca!</p>
    <button onClick={() => onNavigate('presale')} style={styles.bannerButton}>Participar Agora</button>
  </div>
);

// Barra de progresso para Energia e Durabilidade
const Bar = ({ current, max, color }) => {
    const percentage = max > 0 ? (current / max) * 100 : 0;
    return (
        <div style={styles.barContainer}>
            <div style={{ ...styles.barFill, width: `${percentage}%`, background: color }}></div>
        </div>
    );
};

// --- CONSTANTES & FUNÇÕES UTILITÁRIAS ---
const ONE_HOUR_IN_SECONDS = 3600;
const SEVEN_DAYS_IN_SECONDS = 7 * 24 * 3600;

const formatTime = (seconds) => {
    if (seconds < 0) seconds = 0;
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

// --- COMPONENTE PRINCIPAL DA PÁGINA ---
export default function MiningPage({ coinBdg, slots, economyData, handleBuyEnergyForAll, handleRepairCpu, addNewSlot, setRoute }) {

  const totalMiningRate = useMemo(() => {
    return slots.reduce((total, slot) => {
      if (slot.filled && slot.repairCooldown > 0 && slot.durability > 0) {
        const econKey = slot.type === 'free' ? 'free' : slot.tier;
        return total + (economyData[econKey]?.gainPerHour || 0);
      }
      return total;
    }, 0);
  }, [slots, economyData]);

  const getImagePath = (slot) => {
    if (!slot.filled) return '';
    if (slot.type === 'free') return '/cpu gratis.png';
    return `/tier${slot.tier}.png`;
  };

  return (
    <div style={styles.pageContainer}>
      <style>{`
        @keyframes spin {
          0% { stroke-dashoffset: ${2 * Math.PI * (90 - 12)}; }
          100% { stroke-dashoffset: 0; }
        }
      `}</style>

      <MiningCircle balance={coinBdg} miningRate={totalMiningRate} />
      
      <PreSaleBanner onNavigate={setRoute} />

      <div style={styles.actionsContainer}>
        <button onClick={handleBuyEnergyForAll} style={styles.button}>
          Reabastecer Energia
        </button>
        <button onClick={addNewSlot} disabled={slots.length >= 6} style={styles.button}>
          Comprar Gabinete ({slots.length}/6)
        </button>
      </div>

      <div style={{ marginTop: 24 }}>
        <h3 style={styles.sectionTitle}>Sua Sala de Mineração</h3>
        <div style={styles.slotsGrid}>
          {slots.map((slot, index) => (
            <div key={index} style={styles.slotCard}>
              <h4 style={styles.slotTitle}>{slot.name}</h4>
              {slot.filled ? (
                <>
                  <img src={getImagePath(slot)} alt={`CPU ${slot.tier}`} style={styles.slotImage} />
                  <p style={styles.slotTierLabel}>{slot.type === 'free' ? 'CPU Grátis' : `Tier ${slot.tier}`}</p>
                  
                  <p style={styles.slotInfoText}>Energia: {formatTime(slot.repairCooldown)}</p>
                  <Bar current={slot.repairCooldown} max={ONE_HOUR_IN_SECONDS} color="#28a745" />
                  
                  <p style={styles.slotInfoText}>Durabilidade: {formatTime(slot.durability)}</p>
                  <Bar current={slot.durability} max={SEVEN_DAYS_IN_SECONDS} color="#ffc107" />

                  {slot.durability < (SEVEN_DAYS_IN_SECONDS * 0.2) && (
                      <button onClick={() => handleRepairCpu(index)} style={styles.repairButton}>Reparar</button>
                  )}
                </>
              ) : (
                <div style={styles.emptySlot}>
                    <p>Vazio</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <AdsterraAd atOptions={{ 'key': 'aa5093526197a9f66731eaa5facb698f', 'format': 'iframe', 'height': 90, 'width': 728, 'params': {} }} />
    </div>
  );
}

// --- ESTILOS ---
const styles = {
  pageContainer: { padding: '20px 10px 80px 10px', background: '#1a1a1a', color: '#fff' },
  miningCircleContainer: { position: 'relative', width: 180, height: 180, margin: '20px auto' },
  dogImage: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 140, height: 140, borderRadius: '50%' },
  balanceDisplay: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', color: 'white' },
  balanceText: { fontSize: '1.8em', margin: 0, fontFamily: '"Press Start 2P", cursive', textShadow: '0 0 5px black' },
  balanceLabel: { fontSize: '0.8em', margin: 0, color: '#ccc', textShadow: '0 0 3px black' },
  miningRateText: { fontSize: '0.7em', margin: '5px 0 0', color: '#facc15', textShadow: '0 0 3px black' },
  
  bannerContainer: {
    background: 'linear-gradient(45deg, #007BFF, #DC3545)',
    color: 'white',
    padding: '20px',
    borderRadius: '12px',
    textAlign: 'center',
    margin: '30px auto',
    maxWidth: '90%',
    boxShadow: '0 4px 15px rgba(0, 123, 255, 0.3)',
  },
  bannerTitle: { fontFamily: '"Press Start 2P", cursive', margin: '0 0 10px 0', fontSize: '1.2em' },
  bannerText: { margin: '0 0 20px 0', fontSize: '0.9em' },
  bannerButton: { background: 'white', color: '#007BFF', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontFamily: '"Press Start 2P", cursive', fontSize: '0.8em' },

  actionsContainer: { display: 'flex', justifyContent: 'center', gap: '15px', margin: '20px auto' },
  button: { background: '#007BFF', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '8px', cursor: 'pointer', fontFamily: '"Press Start 2P", cursive', fontSize: '0.7em' },
  sectionTitle: { textAlign: 'center', color: '#e4e4e7', fontFamily: '"Press Start 2P", cursive', fontSize: '1em', marginBottom: '20px' },
  slotsGrid: { display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '15px', padding: '10px 0' },
  slotCard: { background: '#2d3748', padding: '12px', borderRadius: '8px', border: '1px solid #007BFF', width: '160px', textAlign: 'center' },
  slotTitle: { margin: '0 0 10px 0', color: '#facc15', fontFamily: '"Press Start 2P", cursive', fontSize: '0.7em' },
  slotImage: { width: '50px', height: '50px', margin: '5px auto', objectFit: 'contain' },
  slotTierLabel: { margin: '8px 0', color: '#e4e4e7', fontSize: '0.8em' },
  slotInfoText: { margin: '12px 0 2px', color: '#a1a1aa', fontSize: '0.7em' },
  barContainer: { background: '#4a5568', borderRadius: '5px', overflow: 'hidden', width: '100%', height: '6px' },
  barFill: { height: '100%' },
  repairButton: { background: '#DC3545', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontFamily: '"Press Start 2P", cursive', fontSize: '0.6em', marginTop: '12px' },
  emptySlot: { color: '#a1a1aa', textAlign: 'center', height: '170px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9em' },
};
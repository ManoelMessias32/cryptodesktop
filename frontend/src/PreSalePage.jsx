import React from 'react';

// Dados dos lotes para a pré-venda
const saleLots = [
  { id: 1, bdg: 1000, price: 1, bonus: 0 },
  { id: 2, bdg: 2500, price: 2, bonus: 5 },   // Bônus de 5%
  { id: 3, bdg: 5000, price: 3, bonus: 10 },  // Bônus de 10%
  { id: 4, bdg: 10000, price: 6, bonus: 15 }, // Bônus de 15%
  { id: 5, bdg: 25000, price: 11, bonus: 20 },// Bônus de 20%
  { id: 6, bdg: 500, price: 0.5, bonus: 0 },
];

// Componente da Página de Pré-Venda
export default function PreSalePage({ handleBuyBdg }) {
  return (
    <div style={styles.pageContainer}>
      <div style={styles.header}>
        <h1 style={styles.title}>Pré-Venda Exclusiva BDG</h1>
        <p style={styles.subtitle}>Aproveite a oportunidade de adquirir BDG com bônus antes do lançamento oficial!</p>
      </div>

      {/* Grid com os lotes */}
      <div style={styles.lotsGrid}>
        {saleLots.map((lot) => (
          <div key={lot.id} style={styles.lotCard}>
            {lot.bonus > 0 && (
              <div style={styles.bonusBanner}>{lot.bonus}% BÔNUS</div>
            )}
            <h3 style={styles.lotBdg}>{lot.bdg.toLocaleString('pt-BR')} BDG</h3>
            <p style={styles.lotPrice}>{lot.price} BNB</p>
            <button 
              style={styles.buyButton}
              onClick={() => handleBuyBdg(lot.price)}
            >
              Comprar Agora
            </button>
          </div>
        ))}
      </div>

      <div style={styles.footer}>
        <p>As compras são finais. Os tokens BDG serão distribuídos em sua carteira conectada após a confirmação da transação na rede BNB.</p>
      </div>
    </div>
  );
}

// --- ESTILOS ---
const styles = {
  pageContainer: { padding: '20px 10px 80px 10px', background: '#1a1a1a', color: '#fff', fontFamily: '"Press Start 2P", cursive' },
  header: { textAlign: 'center', marginBottom: '40px' },
  title: { color: '#facc15', fontSize: '2em', textTransform: 'uppercase', margin: '0 0 10px 0' },
  subtitle: { color: '#a1a1aa', fontSize: '0.9em', maxWidth: '600px', margin: '0 auto' },
  lotsGrid: { display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '20px' },
  lotCard: {
    background: '#2d3748',
    padding: '25px',
    borderRadius: '12px',
    border: '1px solid #007BFF',
    width: '220px',
    textAlign: 'center',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 4px 15px rgba(0, 123, 255, 0.2)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  },
  bonusBanner: {
    position: 'absolute',
    top: '15px',
    right: '-45px',
    background: '#DC3545',
    color: 'white',
    padding: '5px 40px',
    transform: 'rotate(45deg)',
    fontSize: '0.8em',
    fontWeight: 'bold',
  },
  lotBdg: { margin: '10px 0', fontSize: '2em', color: '#facc15' },
  lotPrice: { margin: '0 0 20px 0', fontSize: '1.2em', color: '#007BFF' },
  buyButton: { 
    background: '#007BFF', 
    color: 'white', 
    border: 'none', 
    padding: '12px 25px', 
    borderRadius: '8px', 
    cursor: 'pointer', 
    fontFamily: '"Press Start 2P", cursive', 
    fontSize: '0.9em', 
    width: '100%', 
    transition: 'background-color 0.3s ease',
  },
  footer: { textAlign: 'center', marginTop: '40px', fontSize: '0.8em', color: '#a1a1aa' },
};
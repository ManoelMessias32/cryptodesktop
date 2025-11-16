import React from 'react';

export default function ShopPage() {

  const standardCpuData = {
    1: { price: '0.10', image: '/tier1.png' },
    2: { price: '0.20', image: '/tier2.png' },
    3: { price: '0.30', image: '/tier3.png' },
  };

  const specialCpuData = {
    A: { price: '0.10', gain: '1.300', image: '/special_a.png' },
    B: { price: '0.20', gain: '1.500', image: '/special_b.png' },
    C: { price: '0.30', gain: '1.800', image: '/special_c.png' },
  };

  const styles = {
    shopContainer: { textAlign: 'center' },
    sectionTitle: { color: '#fff', borderBottom: '2px solid #1f4068', paddingBottom: '10px', marginBottom: '20px' },
    cardContainer: { display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center', marginBottom: '40px' },
    card: {
      background: '#162447',
      padding: '16px',
      borderRadius: '8px',
      boxShadow: '0 4px 8px rgba(0,0,0,0.4)',
      width: '200px',
      textAlign: 'center',
      border: '1px solid #1f4068'
    },
    cardImage: { 
      width: '100px', 
      height: '100px', 
      objectFit: 'contain',
      marginBottom: '12px',
      background: 'rgba(255,255,255,0.1)',
      borderRadius: '4px'
    },
    cardTitle: { margin: '0 0 10px 0', color: '#fff', fontSize: '1.2em' },
    cardText: { margin: '4px 0', fontSize: '0.9em', color: '#ccc' }
  };

  return (
    <div style={styles.shopContainer}>
      <h1>Loja</h1>
      <p>Confira os itens disponíveis. As compras são feitas na página de Mineração.</p>
      
      {/* Seção de CPUs Especiais */}
      <h2 style={styles.sectionTitle}>CPUs Especiais</h2>
      <div style={styles.cardContainer}>
        {Object.keys(specialCpuData).map(key => (
          <div key={key} style={styles.card}>
            <img src={specialCpuData[key].image} alt={`CPU Especial ${key}`} style={styles.cardImage} />
            <h3 style={styles.cardTitle}>CPU {key}</h3>
            <p style={styles.cardText}><strong>Preço:</strong> {specialCpuData[key].price} BNB</p>
            <p style={styles.cardText}><strong>Ganho Mensal:</strong> {specialCpuData[key].gain} BDG</p>
          </div>
        ))}
      </div>

      {/* Seção de Componentes Padrão */}
      <h2 style={styles.sectionTitle}>Componentes Padrão</h2>
      <div style={styles.cardContainer}>
        {Object.keys(standardCpuData).map(key => (
          <div key={key} style={styles.card}>
            <img src={standardCpuData[key].image} alt={`Tier ${key}`} style={styles.cardImage} />
            <h3 style={styles.cardTitle}>Tier {key}</h3>
            <p style={styles.cardText}><strong>Preço:</strong> {standardCpuData[key].price} BNB</p>
          </div>
        ))}
      </div>

    </div>
  );
}

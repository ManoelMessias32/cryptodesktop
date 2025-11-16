import React from 'react';

export default function ShopPage() {

  const specialCpuData = {
    A: { price: '0.10', gain: '1.300', image: '/special_a.png', energy: '3 horas', cost: '20.000', maintenance: '30.000', limit: 1 },
    B: { price: '0.20', gain: '1.500', image: '/special_b.png', energy: '4 horas', cost: '30.000', maintenance: '40.000', limit: 2 },
    C: { price: '0.30', gain: '1.800', image: '/special_c.png', energy: '5 horas', cost: '40.000', maintenance: '50.000', limit: 2 },
  };

  const styles = {
    shopContainer: { textAlign: 'center' },
    cardContainer: { display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center', marginTop: '24px' },
    card: {
      background: '#162447',
      padding: '16px',
      borderRadius: '8px',
      boxShadow: '0 4px 8px rgba(0,0,0,0.4)',
      width: '220px',
      textAlign: 'center',
      border: '1px solid #1f4068'
    },
    cardImage: { 
      width: '120px', 
      height: '120px', 
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
      <h2>Loja de CPUs Especiais</h2>
      <p>Confira os itens especiais disponíveis. As compras são feitas na página de Mineração.</p>
      
      <div style={styles.cardContainer}>
        {Object.keys(specialCpuData).map(key => (
          <div key={key} style={styles.card}>
            <img src={specialCpuData[key].image} alt={`CPU Especial ${key}`} style={styles.cardImage} />
            <h3 style={styles.cardTitle}>CPU {key}</h3>
            <p style={styles.cardText}><strong>Preço:</strong> {specialCpuData[key].price} BNB</p>
            <p style={styles.cardText}><strong>Ganho Mensal:</strong> {specialCpuData[key].gain} BDG</p>
            <p style={styles.cardText}><strong>Carga de Energia:</strong> {specialCpuData[key].energy}</p>
            <p style={styles.cardText}><strong>Limite por Jogador:</strong> {specialCpuData[key].limit}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

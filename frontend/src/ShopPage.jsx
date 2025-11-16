import React from 'react';

export default function ShopPage({ onPurchase }) {

  const standardCpuData = {
    1: { name: 'Tier 1', price: '0.10', image: '/tier1.png', type: 'standard' },
    2: { name: 'Tier 2', price: '0.20', image: '/tier2.png', type: 'standard' },
    3: { name: 'Tier 3', price: '0.30', image: '/tier3.png', type: 'standard' },
  };

  const specialCpuData = {
    A: { name: 'CPU A', price: '0.10', gain: '1.300', image: '/special_a.png', type: 'special', tier: 1 },
    B: { name: 'CPU B', price: '0.20', gain: '1.500', image: '/special_b.png', type: 'special', tier: 2 },
    C: { name: 'CPU C', price: '0.30', gain: '1.800', image: '/special_c.png', type: 'special', tier: 3 },
  };

  const styles = {
    shopContainer: { textAlign: 'center' },
    sectionTitle: { color: '#fff', borderBottom: '2px solid #1f4068', paddingBottom: '10px', marginBottom: '20px' },
    cardContainer: { display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center', marginBottom: '40px' },
    card: { background: '#162447', padding: '16px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.4)', width: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' },
    cardImage: { width: '100px', height: '100px', objectFit: 'contain', marginBottom: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', alignSelf: 'center' },
    cardTitle: { margin: '0 0 10px 0', color: '#fff', fontSize: '1.2em' },
    cardText: { margin: '4px 0', fontSize: '0.9em', color: '#ccc' },
    buyButton: { background: '#007bff', color: 'white', border: 'none', padding: '10px', borderRadius: '4px', cursor: 'pointer', marginTop: '10px' }
  };

  return (
    <div style={styles.shopContainer}>
      <h1>Loja</h1>
      <p>Compre uma CPU para instalar em um gabinete vazio na sua Sala de Mineração.</p>
      
      <h2 style={styles.sectionTitle}>CPUs Especiais</h2>
      <div style={styles.cardContainer}>
        {Object.values(specialCpuData).map(item => (
          <div key={item.name} style={styles.card}>
            <div>
              <img src={item.image} alt={item.name} style={styles.cardImage} />
              <h3 style={styles.cardTitle}>{item.name}</h3>
              <p style={styles.cardText}><strong>Preço:</strong> {item.price} BNB</p>
              <p style={styles.cardText}><strong>Ganho Mensal:</strong> {item.gain} BDG</p>
            </div>
            <button onClick={() => onPurchase(item.tier, item.type)} style={styles.buyButton}>Comprar</button>
          </div>
        ))}
      </div>

      <h2 style={styles.sectionTitle}>Componentes Padrão</h2>
      <div style={styles.cardContainer}>
        {Object.keys(standardCpuData).map(key => {
          const item = standardCpuData[key];
          return (
            <div key={item.name} style={styles.card}>
              <div>
                <img src={item.image} alt={item.name} style={styles.cardImage} />
                <h3 style={styles.cardTitle}>{item.name}</h3>
                <p style={styles.cardText}><strong>Preço:</strong> {item.price} BNB</p>
              </div>
              <button onClick={() => onPurchase(Number(key), item.type)} style={styles.buyButton}>Comprar</button>
            </div>
          )
        })}
      </div>
    </div>
  );
}

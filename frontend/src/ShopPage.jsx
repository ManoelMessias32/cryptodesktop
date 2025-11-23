import React from 'react';

export default function ShopPage({ handlePurchase }) {

  const standardCpuData = {
    1: { name: 'Tier 1', price: '3.5', gain: '450', image: '/tier1.png', tier: 1 },
    2: { name: 'Tier 2', price: '9.0', gain: '750', image: '/tier2.jpg', tier: 2 }, // Corrigido para .jpg
    3: { name: 'Tier 3', price: '17.0', gain: '1050', image: '/tier3.png', tier: 3 },
  };

  const specialCpuData = {
    A: { name: 'CPU A', price: '10.0', gain: '1450', image: '/especial_a.jpg', tier: 'A' }, // Corrigido para especial_a.jpg
    B: { name: 'CPU B', price: '20.0', gain: '1650', image: '/especial_b.jpg', tier: 'B' }, // Corrigido para especial_b.jpg
    C: { name: 'CPU C', price: '30.0', gain: '1950', image: '/especial_c.png', tier: 'C' }, // Corrigido para especial_c.png
  };

  const styles = {
    shopContainer: { textAlign: 'center', paddingBottom: '20px' },
    sectionTitle: { color: '#e4e4e7', borderBottom: '1px solid #3f3f46', paddingBottom: '10px', marginBottom: '20px' },
    cardContainer: { display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'center', marginBottom: '30px' },
    card: { background: '#27272a', padding: '12px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.3)', width: '150px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' },
    cardImage: { width: '70px', height: '70px', objectFit: 'contain', marginBottom: '10px', alignSelf: 'center' },
    cardTitle: { margin: '0 0 8px 0', color: '#e4e4e7', fontSize: '1em' },
    cardText: { margin: '4px 0', fontSize: '0.8em', color: '#a1a1aa' },
    buyButton: { background: '#6366f1', color: 'white', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer', marginTop: '10px', width: '100%' }
  };

  return (
    <div style={styles.shopContainer}>
      <h1>Loja</h1>
      <p style={{color: '#a1a1aa', marginTop: '-10px'}}>Compre uma CPU para seu gabinete.</p>
      
      <h2 style={styles.sectionTitle}>CPUs Especiais</h2>
      <div style={styles.cardContainer}>
        {Object.values(specialCpuData).map(item => (
          <div key={item.name} style={styles.card}>
            <div>
              <img src={item.image} alt={item.name} style={styles.cardImage} />
              <h3 style={styles.cardTitle}>{item.name}</h3>
              <p style={styles.cardText}><strong>Preço:</strong> {item.price} TON</p>
              <p style={styles.cardText}><strong>Ganho/Mês:</strong> {item.gain} BDG</p>
            </div>
            <button onClick={() => handlePurchase(item.tier)} style={styles.buyButton}>Comprar</button>
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
                <p style={styles.cardText}><strong>Preço:</strong> {item.price} TON</p>
                <p style={styles.cardText}><strong>Ganho/Mês:</strong> {item.gain} BDG</p> 
              </div>
              <button onClick={() => handlePurchase(item.tier)} style={styles.buyButton}>Comprar</button>
            </div>
          )
        })}
      </div>
    </div>
  );
}

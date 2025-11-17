import React from 'react';

export default function ShopPage({ handlePurchase }) {

  const standardCpuData = {
    1: { name: 'Tier 1', price: '0.035', gain: '350', image: '/tier1.png', type: 'standard' },
    2: { name: 'Tier 2', price: '0.090', gain: '650', image: '/tier2.png', type: 'standard' },
    3: { name: 'Tier 3', price: '0.170', gain: '950', image: '/tier3.png', type: 'standard' },
  };

  const specialCpuData = {
    A: { name: 'CPU A', price: '0.10', gain: '1.300', image: '/special_a.png', type: 'special', tier: 1 },
    B: { name: 'CPU B', price: '0.20', gain: '1.500', image: '/special_b.png', type: 'special', tier: 2 },
    C: { name: 'CPU C', price: '0.30', gain: '1.800', image: '/special_c.png', type: 'special', tier: 3 },
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
              <p style={styles.cardText}><strong>Preço:</strong> {item.price} BNB</p>
              <p style={styles.cardText}><strong>Ganho/Mês:</strong> {item.gain} BDG</p>
            </div>
            <button onClick={() => handlePurchase(item.tier, 'special')} style={styles.buyButton}>Comprar</button>
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
                <p style={styles.cardText}><strong>Ganho/Mês:</strong> {item.gain} BDG</p> 
              </div>
              <button onClick={() => handlePurchase(Number(key), item.type)} style={styles.buyButton}>Comprar</button>
            </div>
          )
        })}
      </div>
    </div>
  );
}

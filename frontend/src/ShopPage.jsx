import React, { useEffect } from 'react';
import { useSendTransaction, useAccount } from 'wagmi';
import { parseEther } from 'viem';

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

const YOUR_BNB_WALLET_ADDRESS = '0x35878269EF4051Df5f82593b4819E518bA8903A3';

const TIER_PRICES_BNB = {
    1: '0.01', 2: '0.025', 3: '0.05', 
    'A': '0.03', 'B': '0.06', 'C': '0.09'
};
const TOKEN_PACK_PRICE_BNB = '0.005';

export default function ShopPage() {
  const { address } = useAccount();
  const { sendTransaction } = useSendTransaction();

  const standardCpuData = {
    1: { name: 'Tier 1', gain: '450', image: '/tier1.png', tier: 1 },
    2: { name: 'Tier 2', gain: '750', image: '/tier2.jpg', tier: 2 },
    3: { name: 'Tier 3', gain: '1050', image: '/tier3.png', tier: 3 },
  };

  const specialCpuData = {
    A: { name: 'CPU A', gain: '1450', image: '/especial_a.jpg', tier: 'A' },
    B: { name: 'CPU B', gain: '1650', image: '/especial_b.jpg', tier: 'B' },
    C: { name: 'CPU C', gain: '1950', image: '/especial_c.png', tier: 'C' },
  };

  const handlePurchase = (tierToBuy) => {
    if (!address) { alert('Por favor, conecte sua carteira primeiro.'); return; }
    const priceInBnb = TIER_PRICES_BNB[tierToBuy];
    sendTransaction({ to: YOUR_BNB_WALLET_ADDRESS, value: parseEther(priceInBnb) });
  };

  const handleBuyBdgCoin = () => {
    if (!address) { alert('Por favor, conecte sua carteira primeiro.'); return; }
    sendTransaction({ to: YOUR_BNB_WALLET_ADDRESS, value: parseEther(TOKEN_PACK_PRICE_BNB) });
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
      <AdsterraAd atOptions={{ 'key': 'aa5093526197a9f66731eaa5facb698f', 'format': 'iframe', 'height': 90, 'width': 728, 'params': {} }} />
      <h1>Loja (BNB Chain)</h1>
      <h2 style={styles.sectionTitle}>Pacotes de Moedas</h2>
      <div style={styles.cardContainer}>
        <div style={styles.card}>
            <div>
              <img src="/bdg_coin_item.png" alt="Token Coin" style={{...styles.cardImage, borderRadius: '50%'}} />
              <h3 style={styles.cardTitle}>150 Token Coin</h3>
              <p style={styles.cardText}><strong>Preço:</strong> {TOKEN_PACK_PRICE_BNB} BNB</p>
              <p style={styles.cardText}>Use para reparos e compras no jogo.</p>
            </div>
            <button onClick={handleBuyBdgCoin} style={styles.buyButton}>Comprar</button>
          </div>
      </div>
      <h2 style={styles.sectionTitle}>CPUs Especiais</h2>
      <div style={styles.cardContainer}>
        {Object.values(specialCpuData).map(item => (
          <div key={item.name} style={styles.card}>
            <div>
              <img src={item.image} alt={item.name} style={styles.cardImage} />
              <h3 style={styles.cardTitle}>{item.name}</h3>
              <p style={styles.cardText}><strong>Preço:</strong> {TIER_PRICES_BNB[item.tier]} BNB</p>
              <p style={styles.cardText}><strong>Ganho/Mês:</strong> {item.gain} BadDOG</p>
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
                <p style={styles.cardText}><strong>Preço:</strong> {TIER_PRICES_BNB[item.tier]} BNB</p>
                <p style={styles.cardText}><strong>Ganho/Mês:</strong> {item.gain} BadDOG</p> 
              </div>
              <button onClick={() => handlePurchase(item.tier)} style={styles.buyButton}>Comprar</button>
            </div>
          )
        })}
      </div>
      <AdsterraAd atOptions={{ 'key': '76c30e6631e256ef38ab65c1ce40cee8', 'format': 'iframe', 'height': 250, 'width': 300, 'params': {} }} />
    </div>
  );
}

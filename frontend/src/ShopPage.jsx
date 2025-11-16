import React from 'react';

export default function ShopPage() {

  const specialCpuData = {
    A: { price: '0.10', gain: '1.300', energy: '3 horas', cost: '20.000', maintenance: '30.000', limit: 1 },
    B: { price: '0.20', gain: '1.500', energy: '4 horas', cost: '30.000', maintenance: '40.000', limit: 2 },
    C: { price: '0.30', gain: '1.800', energy: '5 horas', cost: '40.000', maintenance: '50.000', limit: 2 },
  };

  const styles = {
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '16px', fontSize: '0.9em' },
    th: { border: '1px solid #ddd', padding: '8px', background: '#f2f2f2', textAlign: 'left' },
    td: { border: '1px solid #ddd', padding: '8px', textAlign: 'left' },
  };

  return (
    <div>
      <h2>Loja</h2>
      <p>Navegue até a página de "Mineração" para comprar componentes padrão e CPUs especiais.</p>
      
      <h3>CPUs Especiais - Catálogo</h3>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>CPU</th>
            <th style={styles.th}>Preço (BNB)</th>
            <th style={styles.th}>Ganho mensal (BDG)</th>
            <th style={styles.th}>Carga de energia especial</th>
            <th style={styles.th}>Custo de energia (moeda fictícia)</th>
            <th style={styles.th}>Manutenção diária (moeda fictícia)</th>
            <th style={styles.th}>Limite por jogador</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(specialCpuData).map(key => (
            <tr key={key}>
              <td style={styles.td}>CPU {key}</td>
              <td style={styles.td}>{specialCpuData[key].price}</td>
              <td style={styles.td}>{specialCpuData[key].gain}</td>
              <td style={styles.td}>{specialCpuData[key].energy}</td>
              <td style={styles.td}>{specialCpuData[key].cost} por ativação</td>
              <td style={styles.td}>{specialCpuData[key].maintenance}</td>
              <td style={styles.td}>Máx. {specialCpuData[key].limit}</td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
}

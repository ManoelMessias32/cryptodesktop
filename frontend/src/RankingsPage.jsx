import React from 'react';

// Dados de exemplo - substitua com dados reais da sua API no futuro
const dummyRankings = [
  { rank: 1, name: 'Manoel', score: 150000 },
  { rank: 2, name: 'Gomes', score: 135000 },
  { rank: 3, name: 'Ana', score: 120000 },
  { rank: 4, name: 'Carlos', score: 110000 },
  { rank: 5, name: 'Beatriz', score: 95000 },
  { rank: 6, name: 'Daniel', score: 80000 },
  { rank: 7, name: 'Eduarda', score: 75000 },
  { rank: 8, name: 'Felipe', score: 60000 },
  { rank: 9, name: 'Helena', score: 50000 },
  { rank: 10, name: 'Igor', score: 45000 },
];

// CORREÇÃO: Estilos ajustados para melhor contraste e legibilidade
const styles = {
  container: { padding: '20px', textAlign: 'center', color: '#f4f4f5' }, // Cor de texto padrão mais clara
  title: { fontFamily: '"Press Start 2P", cursive', marginBottom: '30px' },
  table: { width: '100%', maxWidth: '600px', margin: '0 auto', borderCollapse: 'collapse' },
  tableHeader: { borderBottom: '2px solid #facc15', color: '#facc15' },
  tableRow: { borderBottom: '1px solid #3f3f46' },
  tableCell: { padding: '12px 8px', textAlign: 'left' },
  rankCell: { textAlign: 'center', fontWeight: 'bold' },
  scoreCell: { textAlign: 'right', color: '#34d399', fontWeight: 'bold' }, // Verde para destacar o score
};

export default function RankingsPage() {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🏆 Rankings 🏆</h1>
      <table style={styles.table}>
        <thead>
          <tr style={styles.tableHeader}>
            <th style={{...styles.tableCell, ...styles.rankCell}}>#</th>
            <th style={styles.tableCell}>Usuário</th>
            <th style={{...styles.tableCell, ...styles.scoreCell}}>Pontuação</th>
          </tr>
        </thead>
        <tbody>
          {dummyRankings.map(player => (
            <tr key={player.rank} style={styles.tableRow}>
              <td style={{...styles.tableCell, ...styles.rankCell}}>{player.rank}</td>
              <td style={styles.tableCell}>{player.name}</td>
              <td style={{...styles.tableCell, ...styles.scoreCell}}>{player.score.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

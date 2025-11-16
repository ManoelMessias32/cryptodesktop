import React, { useState } from 'react';

// Dados de exemplo (mock data)
const mockData = {
  global: [
    { position: 1, username: 'CryptoKing', score: '1,250,000 BDG' },
    { position: 2, username: 'SatoshiJr', score: '980,000 BDG' },
    { position: 3, username: 'Miner49er', score: '760,000 BDG' },
    { position: 4, username: 'DiamondHands', score: '510,000 BDG' },
    { position: 5, username: 'GamerX', score: '450,000 BDG' },
  ],
  weekly: [
    { position: 1, username: 'NewPlayer123', score: '55,000 BDG' },
    { position: 2, username: 'CryptoKing', score: '51,000 BDG' },
    { position: 3, username: 'FastMiner', score: '48,000 BDG' },
    { position: 4, username: 'SatoshiJr', score: '45,000 BDG' },
    { position: 5, username: 'WeeklyWinner', score: '42,000 BDG' },
  ],
  referrals: [
    { position: 1, username: 'CommunityManager', score: '150 Refs' },
    { position: 2, username: 'DiamondHands', score: '110 Refs' },
    { position: 3, username: 'SocialButterfly', score: '95 Refs' },
    { position: 4, username: 'Influencer', score: '88 Refs' },
    { position: 5, username: 'PlayerTwo', score: '76 Refs' },
  ],
};

export default function RankingsPage() {
  const [activeTab, setActiveTab] = useState('global'); // 'global', 'weekly', 'referrals'

  const styles = {
    container: { textAlign: 'center' },
    tabs: { display: 'flex', justifyContent: 'center', marginBottom: '24px', gap: '10px' },
    tabButton: { 
      padding: '10px 20px', 
      cursor: 'pointer', 
      border: 'none', 
      background: '#162447', 
      color: '#ccc', 
      fontSize: '1em', 
      borderRadius: '8px' 
    },
    activeTabButton: { background: '#007bff', color: 'white', fontWeight: 'bold' },
    table: { width: '100%', maxWidth: '600px', margin: '0 auto', borderCollapse: 'collapse' },
    th: { background: '#1f4068', padding: '12px', borderBottom: '2px solid #007bff' },
    td: { padding: '10px', borderBottom: '1px solid #1f4068' },
    tr: { transition: 'background 0.2s' },
    positionCell: { fontWeight: 'bold', fontSize: '1.1em', width: '50px' }
  };

  const renderTable = (data) => (
    <table style={styles.table}>
      <thead>
        <tr>
          <th style={styles.th}>#</th>
          <th style={styles.th}>Usuário</th>
          <th style={styles.th}>Pontuação</th>
        </tr>
      </thead>
      <tbody>
        {data.map((player, index) => (
          <tr key={index} style={styles.tr}>
            <td style={{...styles.td, ...styles.positionCell}}>{player.position}</td>
            <td style={styles.td}>{player.username}</td>
            <td style={styles.td}>{player.score}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div style={styles.container}>
      <h1>Tabela de Ranques</h1>
      <div style={styles.tabs}>
        <button 
          style={{...styles.tabButton, ...(activeTab === 'global' && styles.activeTabButton)}}
          onClick={() => setActiveTab('global')}
        >
          🏆 Global
        </button>
        <button 
          style={{...styles.tabButton, ...(activeTab === 'weekly' && styles.activeTabButton)}}
          onClick={() => setActiveTab('weekly')}
        >
          ⚡ Semanal
        </button>
        <button 
          style={{...styles.tabButton, ...(activeTab === 'referrals' && styles.activeTabButton)}}
          onClick={() => setActiveTab('referrals')}
        >
          👑 Referências
        </button>
      </div>

      <div>
        {renderTable(mockData[activeTab])}
      </div>
    </div>
  );
}

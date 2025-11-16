import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import MiningPage from './MiningPage';
import ShopPage from './ShopPage';
import UserPage from './UserPage';
import RankingsPage from './RankingsPage';
import { connectWallet } from './wallet';

// Endereço e ABI do token BDG para leitura de saldo
const TOKEN_ADDRESS = '0xcB2e51011e60841B56e278291831E8A4b0D301B2';
const TOKEN_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
];

export default function App() {
  const [route, setRoute] = useState('mine');
  const [address, setAddress] = useState('');
  const [coinBdg, setCoinBdg] = useState(0); // Moeda do jogo, vinda da mineração
  const [tokenBdg, setTokenBdg] = useState('0'); // Token real na carteira

  // Função para buscar o saldo do token BDG
  const fetchTokenBalance = async (userAddress) => {
    if (!userAddress) return;
    try {
      const { provider } = await connectWallet();
      const tokenContract = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, provider);
      const balance = await tokenContract.balanceOf(userAddress);
      const decimals = await tokenContract.decimals();
      setTokenBdg(ethers.utils.formatUnits(balance, decimals));
    } catch (error) {
      console.error('Erro ao buscar saldo do token BDG:', error);
      setTokenBdg('0');
    }
  };

  // Conecta a carteira e busca o saldo inicial
  const handleConnect = async () => {
    try {
      const { address: userAddress } = await connectWallet();
      setAddress(userAddress);
      fetchTokenBalance(userAddress);
    } catch (e) {
      console.error('Erro ao conectar carteira:', e);
    }
  };

  // Efeito para reconectar e atualizar saldos periodicamente
  useEffect(() => {
    if (window.ethereum) {
      handleConnect(); // Tenta conectar ao carregar

      const interval = setInterval(() => {
        if (address) {
          fetchTokenBalance(address);
        }
      }, 15000); // Atualiza saldo a cada 15 segundos

      return () => clearInterval(interval);
    }
  }, [address]);

  const renderPage = () => {
    switch (route) {
      case 'user':
        return <UserPage address={address} />;
      case 'shop':
        return <ShopPage />;
      case 'mine':
        return <MiningPage setCoinBdg={setCoinBdg} />;
      case 'rank':
        return <RankingsPage />;
      default:
        return <MiningPage setCoinBdg={setCoinBdg} />;
    }
  };

  const styles = {
    appContainer: { fontFamily: 'Arial, sans-serif', background: '#1a1a2e', color: '#e0e0e0', minHeight: '100vh', padding: '16px' },
    header: {
      display: 'flex', 
      justifyContent: 'space-around', 
      padding: '12px', 
      background: '#162447',
      borderRadius: '8px',
      marginBottom: '16px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
    },
    balanceBox: { textAlign: 'center' },
    balanceLabel: { fontSize: '0.8em', color: '#a0a0a0', margin: 0 },
    balanceAmount: { fontSize: '1.2em', fontWeight: 'bold', margin: '4px 0 0 0', color: '#fff' },
    nav: {
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      display: 'flex',
      justifyContent: 'space-around',
      background: '#162447',
      padding: '10px 0',
      boxShadow: '0 -2px 5px rgba(0,0,0,0.3)'
    },
    navButton: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      textAlign: 'center',
      color: '#e0e0e0',
      fontSize: '0.8em'
    },
    navButtonActive: {
      color: '#1f4068', // Cor de destaque para o botão ativo
      fontWeight: 'bold'
    }
  };

  return (
    <div style={styles.appContainer}>
      <header style={styles.header}>
        <div style={styles.balanceBox}>
          <p style={styles.balanceLabel}>Coin BDG (Jogo)</p>
          <p style={styles.balanceAmount}>{Math.floor(coinBdg)}</p>
        </div>
        <div style={styles.balanceBox}>
          <p style={styles.balanceLabel}>Token BDG (Carteira)</p>
          <p style={styles.balanceAmount}>{parseFloat(tokenBdg).toFixed(4)}</p>
        </div>
      </header>

      <main style={{ paddingBottom: '80px' }}>
        {renderPage()}
      </main>

      <nav style={styles.nav}>
        <button onClick={() => setRoute('user')} style={{...styles.navButton, ...(route === 'user' && styles.navButtonActive)}}>Usuário</button>
        <button onClick={() => setRoute('shop')} style={{...styles.navButton, ...(route === 'shop' && styles.navButtonActive)}}>Loja</button>
        <button onClick={() => setRoute('mine')} style={{...styles.navButton, ...(route === 'mine' && styles.navButtonActive)}}>Mineração</button>
        <button onClick={() => setRoute('rank')} style={{...styles.navButton, ...(route === 'rank' && styles.navButtonActive)}}>Ranques</button>
      </nav>
    </div>
  );
}

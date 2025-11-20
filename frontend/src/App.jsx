import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ethers } from 'ethers';
import MiningPage from './MiningPage';
import ShopPage from './ShopPage';
import UserPage from './UserPage';
import RankingsPage from './RankingsPage';

import { useAccount, useConnect, useDisconnect, useConnectorClient } from 'wagmi';

function walletClientToSigner(walletClient) {
  if (!walletClient) return undefined;
  const { account, chain, transport } = walletClient;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };
  const provider = new ethers.providers.Web3Provider(transport, network);
  return provider.getSigner(account.address);
}

const SHOP_ADDRESS = '0xA7730c7FAAF932C158d5B10aA3A768CBfD97b98D';
const SHOP_ABI = ['function buyWithBNB(uint256,address) external payable'];

const initialSlots = Array(1).fill({ name: 'Slot 1', filled: false, free: true, repairCooldown: 0, isBroken: false });

export default function App() {
  const [route, setRoute] = useState('mine');
  const [status, setStatus] = useState('Crie um nome e conecte sua carteira para jogar.');
  const [coinBdg, setCoinBdg] = useState(() => Number(localStorage.getItem('cryptoDesktopMined_v14')) || 0);
  const [slots, setSlots] = useState(() => {
    try {
      const savedSlots = localStorage.getItem('cryptoDesktopSlots_v14');
      return savedSlots ? JSON.parse(savedSlots) : initialSlots;
    } catch (e) { return initialSlots; }
  });
  const [inputUsername, setInputUsername] = useState(() => localStorage.getItem('cryptoDesktopUsername') || '');
  
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: walletClient } = useConnectorClient();
  const signer = useMemo(() => walletClientToSigner(walletClient), [walletClient]);
  const { connectors, connect } = useConnect();
  
  // ATUALIZAÇÃO: Adicionado try...catch para depuração no Telegram
  const handleConnect = (connector) => {
    if (!inputUsername.trim()) {
        setStatus('❌ Por favor, insira um nome de usuário.');
        return;
    }
    try {
      setStatus('Tentando conectar...');
      connect({ connector });
    } catch (e) {
      setStatus(`ERRO: ${e.message}`);
    }
  };

  useEffect(() => {
    localStorage.setItem('cryptoDesktopSlots_v14', JSON.stringify(slots));
  }, [slots]);
  useEffect(() => {
    localStorage.setItem('cryptoDesktopMined_v14', coinBdg);
  }, [coinBdg]);
  useEffect(() => {
    localStorage.setItem('cryptoDesktopUsername', inputUsername);
  }, [inputUsername]);

  const handleDisconnect = () => disconnect();
  const handlePurchase = async (tierToBuy) => { /* ... */ };
  const gameLoop = useCallback(() => { /* ... */ }, []);
  useEffect(() => { const i = setInterval(gameLoop, 1000); return () => clearInterval(i); }, [gameLoop]);

  const navButtonStyle = (page) => ({
    padding: '10px 20px',
    margin: '0 5px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    backgroundColor: route === page ? '#5a67d8' : '#4a5568',
    color: 'white',
  });

  const renderPage = () => {
    switch (route) {
      case 'mine':
        return <MiningPage coinBdg={coinBdg} setCoinBdg={setCoinBdg} slots={slots} setSlots={setSlots} economyData={{}} status={status} setStatus={setStatus} />; 
      case 'shop':
        return <ShopPage handlePurchase={handlePurchase} />; 
      case 'user':
        return <UserPage address={address} coinBdg={coinBdg} />; 
      case 'rankings':
        return <RankingsPage />;
      default:
        return <MiningPage coinBdg={coinBdg} setCoinBdg={setCoinBdg} slots={slots} setSlots={setSlots} economyData={{}} status={status} setStatus={setStatus} />;
    }
  };

  const injectedConnector = connectors.find(c => c.id === 'injected');
  const walletConnectConnector = connectors.find(c => c.id === 'walletConnect');

  return (
    <div style={{ background: '#18181b', color: '#f4f4f5', minHeight: '100vh' }}>
      {!isConnected ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
          <h1>Cryptodesk</h1>
          <input placeholder="Crie seu nome de usuário" value={inputUsername} onChange={(e) => setInputUsername(e.target.value)} />
          
          {injectedConnector && (
            <button onClick={() => handleConnect(injectedConnector)} style={{marginTop: '10px'}}>
              Conectar MetaMask
            </button>
          )}
          {walletConnectConnector && (
            <button onClick={() => handleConnect(walletConnectConnector)} style={{marginTop: '10px'}}>
              Conectar com QR Code
            </button>
          )}

          <p>{status}</p>
        </div>
      ) : (
        <>
          <header style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem' }}>
            <p>{`${address.substring(0, 6)}...${address.substring(address.length - 4)}`}</p>
            <button onClick={handleDisconnect}>Sair</button>
          </header>
          
          {renderPage()}

          <nav style={{ position: 'fixed', bottom: 0, width: '100%', display: 'flex', justifyContent: 'center', padding: '1rem', background: '#2d3748' }}>
            <button onClick={() => setRoute('mine')} style={navButtonStyle('mine')}>Minerar</button>
            <button onClick={() => setRoute('shop')} style={navButtonStyle('shop')}>Loja</button>
            <button onClick={() => setRoute('user')} style={navButtonStyle('user')}>Perfil</button>
            <button onClick={() => setRoute('rankings')} style={navButtonStyle('rankings')}>Rankings</button>
          </nav>
        </>
      )}
    </div>
  );
}

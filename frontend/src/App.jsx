import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ethers } from 'ethers';
import MiningPage from './MiningPage';
import ShopPage from './ShopPage';
import UserPage from './UserPage';
import RankingsPage from './RankingsPage';

// Hooks do Wagmi e Web3Modal (com importação oficial)
import { useAccount, useDisconnect, useConnectorClient } from 'wagmi';
import { useWeb3Modal } from '@web3modal/wagmi/react';

// Função para converter o ConnectorClient (viem) para um Signer (ethers@5)
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
const MAX_SLOTS = 6;
const TWENTY_FOUR_HOURS_IN_SECONDS = 24 * 60 * 60;

export const economyData = {
    free: { repairCost: 10, energyCost: 5, gainRate: 0.01 },
    1: { repairCost: 20, energyCost: 10, gainRate: 0.000135 },
    2: { repairCost: 40, energyCost: 20, gainRate: 0.00025 },
    3: { repairCost: 60, energyCost: 30, gainRate: 0.000367 },
};

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
  const [paidBoostTime, setPaidBoostTime] = useState(0);
  
  // CORREÇÃO: Inicializa o estado buscando o valor direto do localStorage.
  const [inputUsername, setInputUsername] = useState(() => localStorage.getItem('cryptoDesktopUsername') || '');
  
  const tierPrices = { 1: '0.035', 2: '0.090', 3: '0.170' };
  
  const { address, isConnected } = useAccount();
  const { open } = useWeb3Modal();
  const { disconnect } = useDisconnect();
  
  const { data: walletClient } = useConnectorClient();
  const signer = useMemo(() => walletClientToSigner(walletClient), [walletClient]);

  useEffect(() => {
    localStorage.setItem('cryptoDesktopSlots_v14', JSON.stringify(slots));
  }, [slots]);
  
  useEffect(() => {
    localStorage.setItem('cryptoDesktopMined_v14', coinBdg);
  }, [coinBdg]);

  // CORREÇÃO: Este useEffect agora apenas salva as alterações no localStorage.
  useEffect(() => {
    localStorage.setItem('cryptoDesktopUsername', inputUsername);
  }, [inputUsername]);

  const handleConnect = () => {
    if (!inputUsername.trim()) {
        setStatus('❌ Por favor, insira um nome de usuário.');
        return;
    }
    open();
  };

  const handleDisconnect = () => {
    disconnect();
  };

  const handlePurchase = async (tierToBuy) => {
    if (!signer) {
      setStatus('❌ Carteira não está pronta. Tente reconectar.');
      return;
    }
    const emptySlotIndex = slots.findIndex(slot => !slot.filled && !slot.free);
    if (emptySlotIndex === -1) {
      setStatus('❌ Você precisa de um gabinete vazio!');
      return;
    }
    try {
      const price = tierPrices[tierToBuy];
      const shopContract = new ethers.Contract(SHOP_ADDRESS, SHOP_ABI, signer);
      setStatus(`Enviando ${price} BNB...`);
      const value = ethers.utils.parseEther(price);
      const tx = await shopContract.buyWithBNB(tierToBuy, '0x35878269EF4051Df5f82593b4819E518bA8903A3', { value });
      await tx.wait();
      setStatus('✅ Compra realizada!');
      setSlots(prev => prev.map((slot, i) => (i === emptySlotIndex ? { ...slot, filled: true, type: 'standard', tier: tierToBuy, repairCooldown: TWENTY_FOUR_HOURS_IN_SECONDS, isBroken: false } : slot)));
    } catch (e) {
      setStatus(`❌ Erro na compra: ${e.message}`);
    }
  };

  const gameLoop = useCallback(() => { /* ... */ }, []);
  useEffect(() => { const i = setInterval(gameLoop, 1000); return () => clearInterval(i); }, [gameLoop]);
  const addNewSlot = () => { /* ... */ };
  const renderPage = () => { /* ... */ };
  const getStatusStyle = () => { /* ... */ };
  const navButtonStyle = (page) => ({ /* ... */ });

  return (
    <div style={{ background: '#18181b', color: '#f4f4f5', minHeight: '100vh' }}>
      {!isConnected ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
          <h1>Cryptodesk</h1>
          <input placeholder="Crie seu nome de usuário" value={inputUsername} onChange={(e) => setInputUsername(e.target.value)} />
          <button onClick={handleConnect}>Conectar e Jogar</button>
          <p>{status}</p>
        </div>
      ) : (
        <>
          <header>
            <p>{`${address.substring(0, 6)}...${address.substring(address.length - 4)}`}</p>
            <button onClick={handleDisconnect}>Sair</button>
          </header>
          {renderPage()}
          <nav>{/* ... */}</nav>
        </>
      )}
    </div>
  );
}

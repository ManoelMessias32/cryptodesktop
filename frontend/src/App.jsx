import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import MiningPage from './MiningPage';
import ShopPage from './ShopPage';
import UserPage from './UserPage';
import RankingsPage from './RankingsPage';
import { connectWallet } from './wallet';

// --- Constants for BNB MAINNET ---
const SHOP_ADDRESS = '0xA7730c7FAAF932C158d5B10aA3A768CBfD97b98D';
const TOKEN_ADDRESS = 'COLOQUE_O_ENDERECO_DO_TOKEN_BDG_NA_MAINNET_AQUI'; // Lembre-se de atualizar quando tiver

const TOKEN_ABI = ['function balanceOf(address owner) view returns (uint256)', 'function decimals() view returns (uint8)'];
const SHOP_ABI = ['function buyWithBNB(uint256,address) external payable'];
const MAX_SLOTS = 6;
const TWENTY_FOUR_HOURS_IN_SECONDS = 24 * 60 * 60;

export const economyData = { /* ... */ };
const initialSlots = [ /* ... */ ];

export default function App() {
  const [route, setRoute] = useState('mine');
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState('Conecte sua carteira para começar.');
  const [coinBdg, setCoinBdg] = useState(() => Number(localStorage.getItem('cryptoDesktopMined_v14')) || 0);
  const [slots, setSlots] = useState(() => {
    try {
      const savedSlots = localStorage.getItem('cryptoDesktopSlots_v14');
      return savedSlots ? JSON.parse(savedSlots) : initialSlots;
    } catch (e) { return initialSlots; }
  });
  // ... (other states)

  const tierPrices = { 1: '0.10', 2: '0.20', 3: '0.30' };

  useEffect(() => { localStorage.setItem('cryptoDesktopSlots_v14', JSON.stringify(slots)); }, [slots]);
  useEffect(() => { localStorage.setItem('cryptoDesktopMined_v14', coinBdg); }, [coinBdg]);

  const handleConnect = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x38' }], // 0x38 é o ID da BNB Mainnet
      });
      const { address: userAddress } = await connectWallet();
      setAddress(userAddress);
      setStatus('Carteira conectada na BNB Mainnet!');
    } catch (e) {
      if (e.code === 4902) {
        setStatus('Por favor, adicione a rede BNB Mainnet à sua MetaMask.');
      } else {
        setStatus(`Falha ao conectar: ${e.message}`);
      }
    }
  };

  const handlePurchase = async (tierToBuy, purchaseType) => {
    const emptySlotIndex = slots.findIndex(slot => !slot.filled && !slot.free);
    if (emptySlotIndex === -1) {
      setStatus('❌ Você precisa de um gabinete vazio!');
      return;
    }
    try {
      const { signer } = await connectWallet();
      const price = tierPrices[tierToBuy];
      const shopContract = new ethers.Contract(SHOP_ADDRESS, SHOP_ABI, signer);
      setStatus(`Enviando ${price} BNB... Confirme na MetaMask.`);
      const value = ethers.utils.parseEther(price);
      
      const tx = await shopContract.buyWithBNB(tierToBuy, '0x35878269EF4051Df5f82593b4819E518bA8903A3', { value });
      
      await tx.wait();
      setSlots(prev => prev.map((slot, i) => (i === emptySlotIndex ? { ...slot, filled: true, type: purchaseType, tier: tierToBuy } : slot)));
      setStatus(`✅ Compra realizada!`);
    } catch (e) {
      setStatus(`❌ Erro na compra: ${e.message || 'Transação cancelada.'}`);
    }
  };
  
  // ... (addNewSlot, gameLoop, renderPage, e o resto do código de renderização)
}

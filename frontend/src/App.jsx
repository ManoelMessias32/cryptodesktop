import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import MiningPage from './MiningPage';
import ShopPage from './ShopPage';
import UserPage from './UserPage';
import RankingsPage from './RankingsPage';
import { connectWallet } from './wallet';

// --- Constants for BNB Testnet ---
const TOKEN_ADDRESS = '0xcB2e51011e60841B56e278291831E8A4b0D301B2';
const SHOP_ADDRESS = '0xeD266DC6Fd8b5124eec783c58BB351E0Bc3C7d59';
const TOKEN_ABI = ['function balanceOf(address owner) view returns (uint256)', 'function decimals() view returns (uint8)'];
const SHOP_ABI = ['function buyWithBNB(uint256,address) external payable'];
const MAX_SLOTS = 6;
const TWENTY_FOUR_HOURS_IN_SECONDS = 24 * 60 * 60;

// ... (economyData, getTodayString, initialSlots)

export default function App() {
  // ... (all state variables)

  const tierPrices = { 1: '0.10', 2: '0.20', 3: '0.30' };

  // ... (all useEffect hooks)

  const handleConnect = async () => {
    // ... (handleConnect logic)
  };

  const handlePurchase = async (tierToBuy, purchaseType) => {
    const emptySlotIndex = slots.findIndex(slot => !slot.filled && !slot.free);
    if (emptySlotIndex === -1) {
      setStatus('❌ Você precisa de um gabinete vazio! Compre um na página de Mineração.');
      return;
    }
    try {
      const { signer } = await connectWallet();
      const price = tierPrices[tierToBuy];
      const shopContract = new ethers.Contract(SHOP_ADDRESS, SHOP_ABI, signer);
      
      // CORREÇÃO AQUI: Mostrando apenas BNB para o usuário
      setStatus(`Enviando ${price} BNB... Confirme na MetaMask.`);
      
      const value = ethers.utils.parseEther(price);
      
      const beneficiaryAddress = '0x35878269EF4051Df5f82593b4819E518bA8903A3';
      const tx = await shopContract.buyWithBNB(tierToBuy, beneficiaryAddress, { value });
      
      await tx.wait();
      setSlots(prev => prev.map((slot, i) => (i === emptySlotIndex ? { ...slot, filled: true, type: purchaseType, tier: tierToBuy, name: `Gabinete ${emptySlotIndex+1}`, repairCooldown: TWENTY_FOUR_HOURS_IN_SECONDS, isBroken: false } : slot)));
      setStatus(`✅ Compra realizada! CPU instalada no Gabinete ${emptySlotIndex + 1}.`);
    } catch (e) {
      setStatus(`❌ Erro na compra: Verifique se você tem tBNB suficiente para a transação.`);
    }
  };

  const addNewSlot = () => {
    // ... (addNewSlot logic)
  };

  const renderPage = () => {
    // ... (renderPage logic)
  };

  // ... (Render logic with if(!address) and the main return)
}

import { Ethers5Modal } from '@web3modal/ethers5';
import { ethers } from 'ethers';

// 1. Defina as redes que seu dApp suporta
const bnbChain = {
  chainId: 56,
  name: 'BNB Smart Chain',
  currency: 'BNB',
  explorerUrl: 'https://bscscan.com',
  rpcUrl: 'https://bsc-dataseed.binance.org/'
}

// 2. Configure o Web3Modal
const projectId = '37e2b189a12b6a74354c78267c260e99';

const metadata = {
  name: 'Cryptodesk',
  description: 'Seu jogo de mineração Web3',
  url: 'https://cryptodesktop.vercel.app',
  icons: ['https://cryptodesktop.vercel.app/logo.png'] // Certifique-se de ter um logo nesta URL
}

const modal = new Ethers5Modal(
  {
    ethersConfig: ethers.providers.getDefaultProvider(),
    chains: [bnbChain],
    projectId
  },
  {
    projectId,
    chainImages: {
      56: 'https://seeklogo.com/images/B/binance-coin-bnb-logo-CD94CC6D31-seeklogo.com.png'
    },
    metadata
  }
);

// --- Funções Exportadas ---

export async function getAddress() {
    try {
        const signer = await modal.getSigner();
        return await signer.getAddress();
    } catch {
        return null;
    }
}

export function openConnectionModal() {
    return modal.open();
}

export function disconnect() {
    return modal.disconnect();
}

export async function getSigner() {
    try {
        return await modal.getSigner();
    } catch {
        return null;
    }
}

export function subscribeToEvents(callback) {
    return modal.subscribeEvents(callback);
}

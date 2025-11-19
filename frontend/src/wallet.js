import { createWeb3Modal, ethers5, defaultConfig } from '@web3modal/ethers5'

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
  icons: ['https://cryptodesktop.vercel.app/logo.png']
}

const modal = createWeb3Modal({
  ethersConfig: defaultConfig({
    metadata,
    defaultChainId: 56,
  }),
  chains: [bnbChain],
  projectId,
  chainImages: {
    56: 'https://seeklogo.com/images/B/binance-coin-bnb-logo-CD94CC6D31-seeklogo.com.png'
  },
})

// --- Funções Exportadas ---

export async function getAddress() {
    try {
        const signer = await ethers5.getSigner({ modal });
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
        return await ethers5.getSigner({ modal });
    } catch {
        return null;
    }
}

export function subscribeToEvents(callback) {
    return modal.subscribeEvents(callback);
}

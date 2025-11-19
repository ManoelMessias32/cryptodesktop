
import { createWeb3Modal, defaultConfig } from '@web3modal/ethers5';
import { ethers } from 'ethers';

// 1. Get a project ID at https://cloud.walletconnect.com
const projectId = 'YOUR_PROJECT_ID'; // <-- Cole seu projectId aqui

// 2. Set chains
const bsc = {
  chainId: 56,
  name: 'BNB Smart Chain',
  currency: 'BNB',
  explorerUrl: 'https://bscscan.com',
  rpcUrl: 'https://bsc-dataseed.binance.org/'
};

// 3. Create modal
const metadata = {
  name: 'Cryptodesk',
  description: 'Seu jogo de mineração de criptomoedas',
  url: 'https://your-game-url.com', //TODO: Troque pela URL do seu jogo
  icons: ['https://your-game-url.com/icon.png'] //TODO: Troque pelo ícone do seu jogo
};

const modal = createWeb3Modal({
  ethersConfig: defaultConfig({ metadata }),
  chains: [bsc],
  projectId,
  themeMode: 'dark',
  enableAnalytics: true // Optional
});

let provider = null;
let signer = null;

async function setupProvider() {
    const walletProvider = modal.getWalletProvider();
    if (walletProvider) {
        provider = new ethers.providers.Web3Provider(walletProvider);
        signer = provider.getSigner();
        return true;
    }
    return false;
}

modal.subscribeProvider(async ({ provider, isConnected }) => {
    if (isConnected) {
        await setupProvider();
    } else {
        provider = null;
        signer = null;
    }
});


export async function connectWallet() {
  if (!modal.getIsConnected()) {
    await modal.open();
  }
  
  const isSetup = await setupProvider();
  if(!isSetup){
      throw new Error("Não foi possível configurar o provedor da carteira.");
  }

  const address = await signer.getAddress();
  
  // Recarrega a página em eventos para simplicidade, como era antes
  modal.getWalletProvider().on("accountsChanged", () => window.location.reload());
  modal.getWalletProvider().on("chainChanged", () => window.location.reload());

  return { provider, signer, address };
}

export async function disconnectWallet() {
  await modal.disconnect();
  provider = null;
  signer = null;
  window.location.reload();
}

export async function checkConnectedWallet() {
    await setupProvider();
    if (modal.getIsConnected() && provider && signer) {
        try {
            const address = await signer.getAddress();
            return { provider, signer, address };
        } catch(e) {
            console.error("checkConnectedWallet error:", e);
            await disconnectWallet(); // Limpa se houver erro
            return null;
        }
    }
    return null;
}

export function getProvider() {
  return provider;
}


import { ethers } from 'ethers';

const Web3Modal = window.Web3Modal.default;
const WalletConnectProvider = window.WalletConnectProvider.default;

let web3Modal;
let provider;
let instance;

const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      rpc: {
        56: 'https://bsc-dataseed.binance.org/', // BNB Chain Mainnet
      },
      chainId: 56,
    },
  },
};

const getWeb3Modal = () => {
  if (!web3Modal) {
    web3Modal = new Web3Modal({
      network: "binance",
      cacheProvider: true, 
      providerOptions,
      theme: "dark",
    });
  }
  return web3Modal;
}

// Lógica de Conexão Principal
export async function connectWallet() {
    // O Telegram injeta seu próprio provedor. Se ele existir, usamos diretamente.
    if (window.Telegram && window.Telegram.WebApp && window.ethereum) {
        console.log("Ambiente do Telegram detectado, usando provedor direto.");
        try {
            provider = new ethers.providers.Web3Provider(window.ethereum);
            await provider.send("eth_requestAccounts", []);
            const signer = provider.getSigner();
            const address = await signer.getAddress();
            return { provider, signer, address };
        } catch(e) {
            console.error("Erro ao conectar diretamente no Telegram:", e);
            throw new Error("Falha ao conectar carteira no Telegram.");
        }
    }
    
    // Para todos os outros ambientes (navegadores de PC, celular), usamos Web3Modal.
    console.log("Ambiente padrão detectado, usando Web3Modal.");
    const modal = getWeb3Modal();
    try {
        instance = await modal.connect();
        provider = new ethers.providers.Web3Provider(instance);
        const signer = provider.getSigner();
        const address = await signer.getAddress();

        instance.on("accountsChanged", () => window.location.reload());
        instance.on("chainChanged", () => window.location.reload());
        instance.on("disconnect", () => disconnectWallet());

        return { provider, signer, address };
    } catch (e) {
        throw new Error("Você cancelou a conexão.");
    }
}

export async function disconnectWallet() {
    const modal = getWeb3Modal();
    if (instance && instance.close) {
        await instance.close();
    }
    await modal.clearCachedProvider();
    provider = null;
    instance = null;
    window.location.reload();
}

// A reconexão automática só funcionará de forma confiável fora do Telegram
export async function checkConnectedWallet() {
    if (window.Telegram && window.Telegram.WebApp) return null; // Desativa auto-connect no Telegram

    const modal = getWeb3Modal();
    if (modal.cachedProvider) {
        try {
            const result = await connectWallet();
            return result;
        } catch (e) {
            await modal.clearCachedProvider();
            return null;
        }
    }
    return null;
}

export function getProvider() {
    if (!provider) return null;
    return provider;
}

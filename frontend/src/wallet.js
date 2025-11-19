import { ethers } from 'ethers';

const Web3Modal = window.Web3Modal.default;
const WalletConnectProvider = window.WalletConnectProvider.default;

let web3Modal;
let provider;
let instance;

// --- Funções de Detecção de Provedor ---

// Procura de forma inteligente pelo provedor da MetaMask, ignorando outros.
const getMetaMaskProvider = () => {
  if (!window.ethereum) return null;
  // O padrão moderno (EIP-6963) é uma lista de provedores.
  if (window.ethereum.providers) {
    return window.ethereum.providers.find((p) => p.isMetaMask) || null;
  }
  // Fallback para o padrão antigo se só houver um provedor.
  if (window.ethereum.isMetaMask) {
    return window.ethereum;
  }
  return null;
};

// --- Lógica de Conexão ---

const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider,
    options: { rpc: { 56: 'https://bsc-dataseed.binance.org/' }, chainId: 56 },
  },
};

const getWeb3Modal = () => {
  if (!web3Modal) {
    web3Modal = new Web3Modal({ network: "binance", cacheProvider: true, providerOptions, theme: "dark" });
  }
  return web3Modal;
};

// Conexão principal que decide a estratégia
export async function connectWallet() {
  // Estratégia 1: Ambiente do Telegram (conexão direta e silenciosa)
  const metaMaskProvider = getMetaMaskProvider();
  if (window.Telegram && window.Telegram.WebApp && metaMaskProvider) {
    try {
      provider = new ethers.providers.Web3Provider(metaMaskProvider);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      return { provider, signer, address };
    } catch (e) {
      throw new Error("Falha ao conectar no Telegram. Tente novamente.");
    }
  }

  // Estratégia 2: Navegadores normais (Usa o pop-up do Web3Modal)
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
  if (instance && typeof instance.close === 'function') {
    await instance.close();
  }
  await modal.clearCachedProvider();
  provider = null;
  instance = null;
  window.location.reload();
}

export async function checkConnectedWallet() {
    if (window.Telegram && window.Telegram.WebApp) return null;
    const modal = getWeb3Modal();
    if (modal.cachedProvider) {
        try {
            return await connectWallet();
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

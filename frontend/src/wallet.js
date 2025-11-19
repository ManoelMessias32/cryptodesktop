import Web3Modal from 'web3modal';
import { ethers } from 'ethers';
import WalletConnectProvider from '@walletconnect/web3-provider';

let web3Modal;
let provider;
let instance;

const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      rpc: {
        56: 'https://bsc-dataseed.binance.org/',
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
      disableInjectedProvider: false, 
    });
  }
  return web3Modal;
}

export async function connectWallet() {
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

export async function checkConnectedWallet() {
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
    return provider;
}

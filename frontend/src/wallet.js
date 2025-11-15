import { ethers } from 'ethers'

export async function connectWallet() {
  if (!window.ethereum) throw new Error('MetaMask não encontrado')
  await window.ethereum.request({ method: 'eth_requestAccounts' })
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const signer = provider.getSigner()
  const address = await signer.getAddress()
  return { provider, signer, address }
}

export function getProvider() {
  if (!window.ethereum) return null
  return new ethers.providers.Web3Provider(window.ethereum)
}

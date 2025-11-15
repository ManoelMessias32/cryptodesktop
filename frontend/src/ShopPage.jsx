import React, { useEffect, useState } from 'react'
import { connectWallet } from './wallet'
import { ethers } from 'ethers'

const SHOP_ADDRESS = '0x35878269EF4051Df5f82593b4819E518bA8903A3'
const SHOP_ABI = [
  'function nextItemId() view returns (uint256)',
  'function items(uint256) view returns (uint256,string,uint256,uint256)',
  'function buyWithToken(uint256,address) external',
  'function buyWithBNB(uint256,address) external payable',
  'function points(address) view returns (uint256)'
]

const TOKEN_ADDRESS = '0xcB2e51011e60841B56e278291831E8A4b0D301B2'
const TOKEN_ABI = [
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function decimals() view returns (uint8)'
]

export default function ShopPage() {
  const [items, setItems] = useState([])
  const [status, setStatus] = useState('')

  useEffect(() => {
    // nothing by default; frontend needs contract addresses from deploy script
  }, [])

  async function loadItems() {
    if (SHOP_ADDRESS.includes('REPLACE')) return setStatus('Defina SHOP_ADDRESS no código')
    try {
      const { provider } = await connectWallet()
      const shop = new ethers.Contract(SHOP_ADDRESS, SHOP_ABI, provider)
      const nextId = (await shop.nextItemId()).toNumber()
      const list = []
      for (let i = 0; i < nextId; i++) {
        const it = await shop.items(i)
        list.push({ id: it[0].toNumber(), name: it[1], priceToken: it[2].toString(), priceBNBWei: it[3].toString() })
      }
      setItems(list)
      setStatus('Itens carregados: ' + list.length)
    } catch (e) {
      setStatus('Erro ao carregar: ' + e.message)
    }
  }

  async function buyWithToken(itemId) {
    if (TOKEN_ADDRESS.includes('REPLACE')) return setStatus('Defina TOKEN_ADDRESS no código')
    try {
      const { signer } = await connectWallet()
      const shop = new ethers.Contract(SHOP_ADDRESS, SHOP_ABI, signer)
      const token = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, signer)
      // get price from items state
      const item = items.find((i) => i.id === itemId)
      const amount = item.priceToken
      setStatus('Aprovando...')
      await token.approve(SHOP_ADDRESS, amount)
      setStatus('Comprando com BDG...')
      const tx = await shop.buyWithToken(itemId, ethers.constants.AddressZero)
      await tx.wait()
      setStatus('Compra com BDG realizada')
    } catch (e) {
      setStatus('Erro: ' + (e.message || e))
    }
  }

  async function buyWithBNB(itemId) {
    try {
      const { signer } = await connectWallet()
      const shop = new ethers.Contract(SHOP_ADDRESS, SHOP_ABI, signer)
      const item = items.find((i) => i.id === itemId)
      const value = item.priceBNBWei
      setStatus('Enviando BNB...')
      const tx = await shop.buyWithBNB(itemId, ethers.constants.AddressZero, { value })
      await tx.wait()
      setStatus('Compra com BNB realizada')
    } catch (e) {
      setStatus('Erro: ' + (e.message || e))
    }
  }

  return (
    <div>
      <h2>Loja</h2>
      <div style={{ marginBottom: 8, fontSize: '0.95em', color: '#555' }}>
        Endereço de depósito das vendas: <span style={{ fontWeight: 'bold', color: '#2a7' }}>{SHOP_ADDRESS}</span>
      </div>
      <div>
        <button onClick={loadItems}>Carregar itens</button>
      </div>
      <div style={{ marginTop: 12 }}>
        {items.map((it) => (
          <div key={it.id} style={{ border: '1px solid #ddd', padding: 8, marginBottom: 8 }}>
            <div>{it.name}</div>
            <div>Preço (BDG): {it.priceToken}</div>
            <div>Preço (BNB wei): {it.priceBNBWei}</div>
            <button onClick={() => buyWithToken(it.id)}>Comprar com BDG</button>
            <button onClick={() => buyWithBNB(it.id)}>Comprar com BNB</button>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 12 }}>{status}</div>
      <p style={{ color: 'darkred' }}>Defina os endereços dos contratos em `frontend/src/ShopPage.jsx` e `MiningPage.jsx` após o deploy.</p>
    </div>
  )
}

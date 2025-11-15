import React, { useState } from 'react'
import MiningPage from './MiningPage'
import ShopPage from './ShopPage'

export default function App() {
  const [route, setRoute] = useState('mine')

  return (
    <div style={{ padding: 24, fontFamily: 'Arial, sans-serif' }}>
      <header style={{ marginBottom: 16 }}>
        <h1 style={{ marginBottom: 8 }}>cryptodesktop</h1>
        <button onClick={() => setRoute('mine')}>Mineração</button>
        <button onClick={() => setRoute('shop')}>Loja</button>
        <div style={{ marginTop: 12 }}>
          <a href="https://t.me/+75qxAall2mFjNmEx" target="_blank" rel="noopener noreferrer" style={{ color: '#229ED9', fontWeight: 'bold', textDecoration: 'none' }}>
            Grupo do Telegram: fique ligado nas novidades!
          </a>
        </div>
      </header>
      <main>
        {route === 'mine' ? <MiningPage /> : <ShopPage />}
      </main>
    </div>
  )
}

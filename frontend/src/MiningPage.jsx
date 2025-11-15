import React, { useState } from 'react'
import { connectWallet } from './wallet'
import { ethers } from 'ethers'

const TOKEN_ADDRESS = '0xcB2e51011e60841B56e278291831E8A4b0D301B2'

export default function MiningPage() {
        // Energia máxima e tempo de uso para cada slot
        const MAX_ENERGY = 100
        const REPAIR_COST = 50
        const REPAIR_TIME = 60 // segundos para exemplo
        const [slotEnergy, setSlotEnergy] = useState([MAX_ENERGY, MAX_ENERGY, MAX_ENERGY, MAX_ENERGY, MAX_ENERGY, MAX_ENERGY])
        const [slotTimers, setSlotTimers] = useState([REPAIR_TIME, REPAIR_TIME, REPAIR_TIME, REPAIR_TIME, REPAIR_TIME, REPAIR_TIME])
        const [needsRepair, setNeedsRepair] = useState([false, false, false, false, false, false])

        // Simula consumo de energia e tempo de uso
        React.useEffect(() => {
          const interval = setInterval(() => {
            setSlotTimers((prev) => prev.map((t, i) => {
              if (needsRepair[i] || slotEnergy[i] <= 0) return t
              return t > 0 ? t - 1 : 0
            }))
            setSlotEnergy((prev) => prev.map((e, i) => {
              if (needsRepair[i] || e <= 0) return e
              return slotTimers[i] > 0 ? e - 1 : 0
            }))
            setNeedsRepair((prev) => prev.map((r, i) => slotEnergy[i] <= 0 || slotTimers[i] <= 0))
          }, 1000)
          return () => clearInterval(interval)
        }, [slotEnergy, slotTimers, needsRepair])

        function handleRepairSlot(idx) {
          setSlotEnergy((prev) => prev.map((e, i) => i === idx ? MAX_ENERGY : e))
          setSlotTimers((prev) => prev.map((t, i) => i === idx ? REPAIR_TIME : t))
          setNeedsRepair((prev) => prev.map((r, i) => i === idx ? false : r))
          setStatus(`Slot ${idx + 1} reparado! (-${REPAIR_COST} Coin BDG)`)
        }
      const monthlyBDG = {
        free: '200',
        1: '400–500',
        2: '800–1000',
        3: '1400–1600'
      }
    const piecePrices = {
      motherboard: { 1: '0.005', 2: '0.010', 3: '0.020' },
      cpu:        { 1: '0.010', 2: '0.030', 3: '0.050' },
      gpu:        { 1: '0.020', 2: '0.050', 3: '0.100' }
    }
  const [connected, setConnected] = useState(false)
  const [address, setAddress] = useState('')
  const [mined, setMined] = useState(0)
  const [status, setStatus] = useState('')
  const [miningCount, setMiningCount] = useState(0)
  const [slots, setSlots] = useState([
    { name: 'CPU 1 (Grátis)', filled: false, free: true },
    { name: 'CPU 2 (Grátis)', filled: false, free: true },
    { name: 'CPU 3', filled: false, free: false, tier: 1 },
    { name: 'CPU 4', filled: false, free: false, tier: 1 },
    { name: 'CPU 5', filled: false, free: false, tier: 1 },
    { name: 'CPU 6', filled: false, free: false, tier: 1 }
  ])
    const tierPrices = {
      1: '0.035', // Básico
      2: '0.090', // Intermediário
      3: '0.170'  // Avançado
    }
  // Simula mineração automática
  React.useEffect(() => {
    const timer = setInterval(() => {
      setMiningCount((c) => c + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  function handleMountFree(idx) {
    setSlots((prev) => prev.map((slot, i) => i === idx ? { ...slot, filled: true } : slot))
    setStatus(`CPU ${idx + 1} montado gratuitamente com Coin BDG!`)
  }

  async function handleBuyBNB(idx) {
    try {
      setStatus('Conectando carteira...')
      const { signer } = await connectWallet()
      const slot = slots[idx]
      const tier = slot.tier || 1
      const price = tierPrices[tier]
      const shop = new ethers.Contract('0xeD266DC6Fd8b5124eec783c58BB351E0Bc3C7d59', [
        'function buyWithBNB(uint256,address) external payable'
      ], signer)
      setStatus(`Enviando BNB (Tier ${tier})...`)
      const value = ethers.utils.parseEther(price)
      const tx = await shop.buyWithBNB(idx, ethers.constants.AddressZero, { value })
      await tx.wait()
      setSlots((prev) => prev.map((slot, i) => i === idx ? { ...slot, filled: true } : slot))
      setStatus(`CPU ${idx + 1} comprado com BNB! (Tier ${tier})`)
    } catch (e) {
      setStatus('Erro ao comprar com BNB: ' + (e.message || e))
    }
  }

  async function handleConnect() {
    try {
      const { signer, address } = await connectWallet()
      setConnected(true)
      setAddress(address)
    } catch (e) {
      setStatus(e.message)
    }
  }

  function doMine() {
    // Simula mineração: gera tokens locais (pontos)
    setMined((m) => m + 1)
  }

  async function claim() {
    if (!window.ethereum) return setStatus('MetaMask não detectado')
    try {
      setStatus('Enviando requisição para o servidor...')
      const { address } = await connectWallet()
      const response = await fetch('/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ address, amount: mined })
      });
      const data = await response.json();
      if (response.ok) {
        setStatus('Reivindicado: ' + mined + ' BDG')
        setMined(0)
      } else {
        setStatus('Erro: ' + data.message)
      }
    } catch (e) {
      setStatus('Erro: ' + (e.message || e))
    }
  }

  return (
    <div>
      <h2>Mineração (simulada)</h2>
      {!connected ? (
        <button onClick={handleConnect}>Conectar MetaMask</button>
      ) : (
        <div>Conectado: {address}</div>
      )}
      <div style={{ marginTop: 12 }}>
        <div style={{ fontSize: '1.2em', marginBottom: 8 }}>
          Minerando... <span style={{ fontWeight: 'bold', color: '#2a7' }}>{miningCount}</span> hashes
        </div>
        <button onClick={doMine}>Minerar (simular)</button>
        <div>Minado localmente: {mined} Coin BDG</div>
        <button onClick={claim} disabled={mined === 0}>Reivindicar</button>
      </div>
      <div style={{ marginTop: 24, padding: 12, border: '1px solid #eee', borderRadius: 8, background: '#fafafa', maxWidth: 420 }}>
        <h4 style={{ color: '#444', marginBottom: 8 }}>Usos da Coin BDG</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          <button style={{ fontSize: '0.95em' }} onClick={() => setStatus('Reparo realizado! (-50 Coin BDG)')}>Reparar computador (-50)</button>
          <button style={{ fontSize: '0.95em' }} onClick={() => setStatus('Energia comprada! (-20 Coin BDG)')}>Comprar energia (-20)</button>
          <button style={{ fontSize: '0.95em' }} onClick={() => setStatus('Cooler comprado! (-15 Coin BDG)')}>Comprar cooler (-15)</button>
          <button style={{ fontSize: '0.95em' }} onClick={() => setStatus('Upgrade realizado! (-100 Coin BDG)')}>Upgrade de componente (-100)</button>
          <button style={{ fontSize: '0.95em' }} onClick={() => setStatus('Skin aplicada! (-30 Coin BDG)')}>Comprar skin (-30)</button>
          <button style={{ fontSize: '0.95em' }} onClick={() => setStatus('Boost de mineração ativado! (-80 Coin BDG)')}>Ativar boost temporário (-80)</button>
        </div>
        <div style={{ fontSize: '0.95em', color: '#555', marginTop: 8 }}>
          Simulação de funcionalidades que podem ser desbloqueadas com a Coin BDG do jogo.
        </div>
      </div>
      <div style={{ marginTop: 24 }}>
        <h3>Monte seu computador para minerar</h3>
        <div style={{ display: 'flex', gap: 16 }}>
          {slots.map((slot, idx) => (
            <div key={idx} style={{ border: '2px dashed #aaa', borderRadius: 8, width: 170, height: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: slot.filled ? '#e0ffe0' : '#fff', position: 'relative' }}>
              <div style={{ fontWeight: 'bold', marginBottom: 8 }}>{slot.name}</div>
              {/* Barra de energia */}
              <div style={{ width: '90%', height: 18, background: '#eee', borderRadius: 8, marginBottom: 6, position: 'relative', boxShadow: slotEnergy[idx] < 30 ? '0 0 8px 2px #e22' : '0 0 4px 1px #2a7', transition: 'box-shadow 0.3s' }}>
                <div style={{ width: `${slotEnergy[idx]}%`, height: '100%', background: slotEnergy[idx] > 30 ? 'linear-gradient(90deg,#2a7,#7fffd4)' : 'linear-gradient(90deg,#e22,#ffb6b6)', borderRadius: 8, transition: 'width 0.5s' }}></div>
                <span style={{ position: 'absolute', left: '50%', top: 0, transform: 'translateX(-50%)', fontSize: '0.9em', color: slotEnergy[idx] < 30 ? '#e22' : '#222', fontWeight: slotEnergy[idx] < 30 ? 'bold' : 'normal', textShadow: slotEnergy[idx] < 30 ? '0 0 2px #fff' : 'none' }}>{slotEnergy[idx]}%</span>
              </div>
              <div style={{ fontSize: '0.9em', marginBottom: 6 }}>
                Tempo restante: {slotTimers[idx]}s
              </div>
              {needsRepair[idx] && (
                <div style={{ color: '#e22', fontWeight: 'bold', marginBottom: 6 }}>Precisa de reparo!</div>
              )}
              {!slot.free && !slot.filled && (
                <>
                  <div style={{ marginBottom: 8 }}>
                    <label htmlFor={`tier-select-${idx}`}>Tier:</label>
                    <select
                      id={`tier-select-${idx}`}
                      value={slot.tier}
                      onChange={e => {
                        const newTier = Number(e.target.value)
                        setSlots(prev => prev.map((s, i) => i === idx ? { ...s, tier: newTier } : s))
                      }}
                      style={{ marginLeft: 4 }}
                    >
                      <option value={1}>Básico</option>
                      <option value={2}>Intermediário</option>
                      <option value={3}>Avançado</option>
                    </select>
                  </div>
                  <div style={{ fontSize: '0.9em', marginBottom: 8, textAlign: 'left' }}>
                    <div>Placa-mãe: {piecePrices.motherboard[slot.tier || 1]} BNB</div>
                    <div>Processador: {piecePrices.cpu[slot.tier || 1]} BNB</div>
                    <div>Placa de vídeo: {piecePrices.gpu[slot.tier || 1]} BNB</div>
                    <div style={{ fontWeight: 'bold', marginTop: 4 }}>Total: {tierPrices[slot.tier || 1]} BNB</div>
                    <div style={{ marginTop: 6, color: '#2a7' }}>
                      Ganhos mensais: {monthlyBDG[slot.tier || 1]} BDG
                    </div>
                  </div>
                </>
              )}
              {slot.filled ? (
                <span style={{ color: 'green' }}>Montado</span>
              ) : slot.free ? (
                <>
                  <button style={{ fontSize: '0.9em' }} onClick={() => handleMountFree(idx)}>Montar grátis (Coin BDG)</button>
                  <div style={{ marginTop: 8, color: '#2a7', fontSize: '0.9em' }}>Ganhos mensais: {monthlyBDG.free} BDG</div>
                </>
              ) : (
                <button style={{ fontSize: '0.9em' }} onClick={() => handleBuyBNB(idx)}>Comprar com BNB</button>
              )}
              {/* Botão de reparo se necessário */}
              {needsRepair[idx] && (
                <button
                  style={{
                    fontSize: '0.9em',
                    marginTop: 8,
                    background: '#e22',
                    color: '#fff',
                    boxShadow: '0 0 8px 2px #e22',
                    border: 'none',
                    borderRadius: 6,
                    padding: '6px 16px',
                    cursor: 'pointer',
                    transition: 'transform 0.1s',
                  }}
                  onClick={e => {
                    e.target.style.transform = 'scale(0.95)';
                    setTimeout(() => { e.target.style.transform = 'scale(1)' }, 120);
                    handleRepairSlot(idx);
                  }}
                >
                  Reparar (-{REPAIR_COST} Coin BDG)
                </button>
              )}
            </div>
          ))}
        </div>
        <div style={{ fontSize: '0.95em', color: '#555', marginTop: 8 }}>
          Os dois primeiros CPUs podem ser montados gratuitamente com Coin BDG.<br />Os demais exigem compra com BNB.
        </div>
      </div>
      <div style={{ marginTop: 32, padding: 16, border: '1px solid #229ED9', borderRadius: 8, background: '#f7fbff', maxWidth: 340 }}>
        <h4 style={{ color: '#229ED9', marginBottom: 8 }}>Ganhos por referência</h4>
        <ul style={{ paddingLeft: 18, margin: 0, fontSize: '1em', color: '#222' }}>
          <li>10 refs = 15 BDG</li>
          <li>50 refs = 100 BDG</li>
          <li>100 refs = 250 BDG</li>
        </ul>
        <div style={{ fontSize: '0.95em', color: '#555', marginTop: 8 }}>
          Compartilhe seu código de referência para ganhar mais BDG!
        </div>
      </div>
      <div style={{ marginTop: 24, padding: 12, border: '1px solid #2a7', borderRadius: 8, background: '#f9fff7', maxWidth: 340 }}>
        <h4 style={{ color: '#2a7', marginBottom: 6 }}>Token BDG</h4>
        <div style={{ fontSize: '1em', color: '#222', marginBottom: 4 }}>
          Contrato: <span style={{ fontWeight: 'bold', wordBreak: 'break-all' }}>0xcB2e51011e60841B56e278291831E8A4b0D301B2</span>
        </div>
        <div style={{ fontSize: '0.95em', color: '#555' }}>
          Rede: <span style={{ fontWeight: 'bold' }}>BNB Testnet</span>
        </div>
      </div>
      <div style={{ marginTop: 24, padding: 12, border: '1px solid #aaa', borderRadius: 8, background: '#fff', maxWidth: 420 }}>
        <h4 style={{ color: '#444', marginBottom: 8 }}>Ganhos por hora (Coin BDG)</h4>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.98em' }}>
          <thead>
            <tr style={{ background: '#f2f2f2' }}>
              <th style={{ padding: '4px 8px', border: '1px solid #ddd' }}>Tier</th>
              <th style={{ padding: '4px 8px', border: '1px solid #ddd' }}>Energia/h</th>
              <th style={{ padding: '4px 8px', border: '1px solid #ddd' }}>Cooler/h</th>
              <th style={{ padding: '4px 8px', border: '1px solid #ddd' }}>Margem/h</th>
              <th style={{ padding: '4px 8px', border: '1px solid #ddd' }}>Ganho bruto/h</th>
              <th style={{ padding: '4px 8px', border: '1px solid #ddd' }}>Sugerido</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '4px 8px', border: '1px solid #ddd' }}>Free</td>
              <td style={{ padding: '4px 8px', border: '1px solid #ddd' }}>10.000</td>
              <td style={{ padding: '4px 8px', border: '1px solid #ddd' }}>1.250</td>
              <td style={{ padding: '4px 8px', border: '1px solid #ddd' }}>1.000</td>
              <td style={{ padding: '4px 8px', border: '1px solid #ddd' }}>12.250</td>
              <td style={{ padding: '4px 8px', border: '1px solid #ddd' }}>12.000</td>
            </tr>
            <tr>
              <td style={{ padding: '4px 8px', border: '1px solid #ddd' }}>T1</td>
              <td style={{ padding: '4px 8px', border: '1px solid #ddd' }}>12.000</td>
              <td style={{ padding: '4px 8px', border: '1px solid #ddd' }}>1.667</td>
              <td style={{ padding: '4px 8px', border: '1px solid #ddd' }}>2.000</td>
              <td style={{ padding: '4px 8px', border: '1px solid #ddd' }}>15.667</td>
              <td style={{ padding: '4px 8px', border: '1px solid #ddd' }}>16.000</td>
            </tr>
            <tr>
              <td style={{ padding: '4px 8px', border: '1px solid #ddd' }}>T2</td>
              <td style={{ padding: '4px 8px', border: '1px solid #ddd' }}>15.000</td>
              <td style={{ padding: '4px 8px', border: '1px solid #ddd' }}>2.083</td>
              <td style={{ padding: '4px 8px', border: '1px solid #ddd' }}>4.000</td>
              <td style={{ padding: '4px 8px', border: '1px solid #ddd' }}>21.083</td>
              <td style={{ padding: '4px 8px', border: '1px solid #ddd' }}>21.000</td>
            </tr>
            <tr>
              <td style={{ padding: '4px 8px', border: '1px solid #ddd' }}>T3</td>
              <td style={{ padding: '4px 8px', border: '1px solid #ddd' }}>18.000</td>
              <td style={{ padding: '4px 8px', border: '1px solid #ddd' }}>2.083</td>
              <td style={{ padding: '4px 8px', border: '1px solid #ddd' }}>6.000</td>
              <td style={{ padding: '4px 8px', border: '1px solid #ddd' }}>26.083</td>
              <td style={{ padding: '4px 8px', border: '1px solid #ddd' }}>26.000</td>
            </tr>
          </tbody>
        </table>
        <div style={{ fontSize: '0.95em', color: '#555', marginTop: 8 }}>
          Valores demonstrativos para simulação dos ganhos por hora no jogo.
        </div>
      </div>
      <div style={{ marginTop: 12, color: 'green' }}>{status}</div>
    </div>
  )
}

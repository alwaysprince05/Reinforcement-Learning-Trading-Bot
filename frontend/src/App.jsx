import { useState, useRef, useCallback } from 'react'
import HeroStats from './components/HeroStats'
import TrainingProgress from './components/TrainingProgress'
import PriceChart from './components/PriceChart'
import EquityCurve from './components/EquityCurve'
import EpisodeRewards from './components/EpisodeRewards'
import ErrorBoundary from './components/ErrorBoundary'

export default function App() {
  const [isTraining, setIsTraining] = useState(false)
  const [training, setTraining] = useState(null)   // live episode data
  const [results, setResults] = useState(null)     // final results
  const [error, setError] = useState(null)
  const abortRef = useRef(null)

  const runTraining = useCallback(async () => {
    setIsTraining(true)
    setTraining(null)
    setResults(null)
    setError(null)

    const ctrl = new AbortController()
    abortRef.current = ctrl

    let gotDone = false

    try {
      const res = await fetch('/api/train?episodes=50', { signal: ctrl.signal })
      if (!res.ok) throw new Error(`Server error: ${res.status}`)

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      const processChunk = (chunk) => {
        buffer += chunk
        const parts = buffer.split('\n\n')
        buffer = parts.pop() // keep last incomplete part

        for (const part of parts) {
          for (const line of part.split('\n')) {
            if (!line.startsWith('data: ')) continue
            let payload
            try { payload = JSON.parse(line.slice(6)) } catch { continue }

            if (payload.done) {
              // Results are embedded directly in the done event
              const { done: _d, ...resultData } = payload
              setResults(resultData)
              setTraining(null)
            } else {
              setTraining(payload)
            }
          }
        }
      }

      while (true) {
        const { value, done } = await reader.read()
        if (value) processChunk(decoder.decode(value, { stream: true }))
        if (done) break
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message)
      } else {
        // Even if stopped, try to get partial results
        try {
          const r = await fetch('/api/results')
          const data = await r.json()
          if (!data.error) { setResults(data); setTraining(null) }
        } catch {}
      }
    } finally {
      setIsTraining(false)
    }
  }, [])

  const stopTraining = () => {
    abortRef.current?.abort()
    setIsTraining(false)
  }

  return (
    <div className="dashboard">
      {/* ── Header ── */}
      <header className="header">
        <div className="header-left">
          <div className="header-badge">
            <span className="dot" />
            Reinforcement Learning
          </div>
          <h1>RL Trading Bot Dashboard</h1>
          <div className="header-sub">
            Q-Learning Agent · Synthetic Price Data · Real-time Training Visualization
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {isTraining && (
            <button
              id="stop-btn"
              className="run-btn"
              onClick={stopTraining}
              style={{ background: 'linear-gradient(135deg,#7f1d1d,#ef4444)', boxShadow: '0 4px 20px rgba(239,68,68,0.4)' }}
            >
              ⏹ Stop
            </button>
          )}
          <button
            id="run-training-btn"
            className="run-btn"
            onClick={runTraining}
            disabled={isTraining}
          >
            {isTraining ? '⚙️ Training…' : results ? '🔄 Retrain' : '▶ Run Training'}
          </button>
        </div>
      </header>

      {/* ── Error banner ── */}
      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.1)',
          border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: 10,
          padding: '12px 20px',
          color: '#fca5a5',
          fontSize: 13,
          marginBottom: 24,
        }}>
          ⚠️ {error} — Make sure the FastAPI backend is running on port 8000.
        </div>
      )}

      {/* ── Live training progress ── */}
      <TrainingProgress training={training} />

      {/* ── Stats cards ── */}
      <HeroStats results={results} training={training} />

      {/* ── Charts ── */}
      <div className="charts-grid">
        <ErrorBoundary name="Price Chart">
          <PriceChart results={results} />
        </ErrorBoundary>
        <ErrorBoundary name="Equity Curve">
          <EquityCurve results={results} />
        </ErrorBoundary>
      </div>

      <ErrorBoundary name="Episode Rewards">
        <EpisodeRewards results={results} />
      </ErrorBoundary>

      {/* ── Footer ── */}
      <footer className="footer">
        <span>RL Trading Bot — Q-Learning Agent on Synthetic Price Data</span>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }}>
          Prince Maurya · {new Date().getFullYear()}
        </span>
      </footer>
    </div>
  )
}

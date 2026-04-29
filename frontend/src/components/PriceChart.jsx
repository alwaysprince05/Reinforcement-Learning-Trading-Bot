import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  const val = payload[0]?.value
  const sig = payload[0]?.payload?.signal
  return (
    <div style={{
      background: '#0d1f3c',
      border: '1px solid rgba(99,179,237,0.4)',
      borderRadius: 8,
      padding: '10px 14px',
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: 12,
    }}>
      <div style={{ color: '#94a3b8', marginBottom: 4 }}>Step {label}</div>
      <div style={{ color: '#3b82f6' }}>
        Price: ${val != null ? Number(val).toFixed(2) : '—'}
      </div>
      {sig === 'buy' && <div style={{ color: '#10b981' }}>▲ Buy Signal</div>}
      {sig === 'sell' && <div style={{ color: '#ef4444' }}>▼ Sell Signal</div>}
    </div>
  )
}

// Custom dot rendered for buy/sell points only — pass as component reference to Recharts
function SignalDot(props) {
  const { cx, cy, payload } = props
  // Guard against missing coords (Recharts passes undefined on unmeasured renders)
  if (cx == null || cy == null || !payload?.signal) return null

  if (payload.signal === 'buy') {
    return (
      <g key={`buy-${cx}-${cy}`}>
        <polygon
          points={`${cx},${cy - 9} ${cx - 6},${cy + 3} ${cx + 6},${cy + 3}`}
          fill="#10b981"
          opacity={0.9}
        />
      </g>
    )
  }
  if (payload.signal === 'sell') {
    return (
      <g key={`sell-${cx}-${cy}`}>
        <polygon
          points={`${cx},${cy + 9} ${cx - 6},${cy - 3} ${cx + 6},${cy - 3}`}
          fill="#ef4444"
          opacity={0.9}
        />
      </g>
    )
  }
  return null
}

export default function PriceChart({ results }) {
  if (!results) {
    return (
      <div className="chart-card">
        <div className="chart-title">
          <span className="accent-dot" style={{ '--dot-color': 'var(--accent-blue)' }} />
          Price Chart &amp; Trade Signals
        </div>
        <div className="idle-state">
          <div className="idle-icon">📉</div>
          <div className="idle-text">
            Run training to see<br />price chart with buy/sell signals
          </div>
        </div>
      </div>
    )
  }

  const { prices, buy_signals, sell_signals } = results
  if (!Array.isArray(prices) || prices.length === 0) return null

  const buySet = new Set(buy_signals || [])
  const sellSet = new Set(sell_signals || [])

  const step = Math.max(1, Math.floor(prices.length / 300))
  const data = prices
    .filter((_, i) => i % step === 0)
    .map((price, idx) => {
      const origIdx = idx * step
      const sig = buySet.has(origIdx) ? 'buy' : sellSet.has(origIdx) ? 'sell' : null
      return {
        index: origIdx,
        price: parseFloat(Number(price).toFixed(2)),
        signal: sig,
      }
    })

  return (
    <div className="chart-card fade-in">
      <div className="chart-title">
        <span className="accent-dot" style={{ '--dot-color': 'var(--accent-blue)' }} />
        Price Chart &amp; Trade Signals
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="index" tick={false} />
          <YAxis
            domain={['auto', 'auto']}
            tickFormatter={v => v != null ? `$${Number(v).toFixed(0)}` : ''}
            width={52}
          />
          <Tooltip content={<CustomTooltip />} />
          {/* Pass component reference (not element) to dot prop */}
          <Line
            type="monotone"
            dataKey="price"
            name="Price"
            stroke="#3b82f6"
            strokeWidth={1.5}
            dot={SignalDot}
            activeDot={{ r: 4, fill: '#60a5fa', strokeWidth: 0 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="legend">
        <div className="legend-item">
          <div className="legend-dot" style={{ background: '#3b82f6' }} />
          Price
        </div>
        <div className="legend-item">
          <div className="legend-dot" style={{ background: '#10b981' }} />
          ▲ Buy
        </div>
        <div className="legend-item">
          <div className="legend-dot" style={{ background: '#ef4444' }} />
          ▼ Sell
        </div>
      </div>
    </div>
  )
}

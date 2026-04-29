import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  const val = payload[0]?.value
  const profit = val - 10000
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
      <div style={{ color: val >= 10000 ? '#10b981' : '#ef4444' }}>
        Equity: ${Number(val).toFixed(2)}
      </div>
      <div style={{ color: '#94a3b8' }}>
        P&amp;L: {profit >= 0 ? '+' : ''}${Number(profit).toFixed(2)}
      </div>
    </div>
  )
}

export default function EquityCurve({ results }) {
  if (!results) {
    return (
      <div className="chart-card">
        <div className="chart-title">
          <span className="accent-dot" />
          Equity Curve
        </div>
        <div className="idle-state">
          <div className="idle-icon">📊</div>
          <div className="idle-text">
            Run training to see<br />portfolio equity over time
          </div>
        </div>
      </div>
    )
  }

  const { equity_curve } = results
  if (!Array.isArray(equity_curve) || equity_curve.length === 0) {
    return null
  }

  const finalEquity = equity_curve[equity_curve.length - 1]
  const finalProfit = finalEquity - 10000
  const color = finalProfit >= 0 ? '#10b981' : '#ef4444'

  const step = Math.max(1, Math.floor(equity_curve.length / 300))
  const data = equity_curve
    .filter((_, i) => i % step === 0)
    .map((equity, i) => ({
      index: i * step,
      equity: parseFloat(Number(equity).toFixed(2)),
    }))

  return (
    <div className="chart-card fade-in">
      <div className="chart-title">
        <span
          className="accent-dot"
          style={{ '--dot-color': color }}
        />
        Equity Curve
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="index" tick={false} />
          <YAxis
            domain={['auto', 'auto']}
            tickFormatter={v => `$${Number(v).toFixed(0)}`}
            width={62}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={10000} stroke="rgba(255,255,255,0.15)" strokeDasharray="4 4" />
          <Area
            type="monotone"
            dataKey="equity"
            name="Equity"
            stroke={color}
            strokeWidth={2}
            fill="url(#equityGrad)"
            dot={false}
            activeDot={{ r: 3, fill: color, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="legend">
        <div className="legend-item">
          <div className="legend-dot" style={{ background: color }} />
          Portfolio Value
        </div>
        <div className="legend-item" style={{ opacity: 0.4 }}>
          - - - Baseline $10,000
        </div>
      </div>
    </div>
  )
}

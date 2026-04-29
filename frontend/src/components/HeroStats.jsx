export default function HeroStats({ results, training }) {
  const profit = results?.final_profit ?? null
  const sharpe = results?.sharpe_ratio ?? null
  const trades = results?.total_trades ?? null
  const equity = results?.equity_curve
    ? results.equity_curve[results.equity_curve.length - 1]
    : null

  const cards = [
    {
      label: 'Final Profit',
      icon: '💰',
      value: profit !== null
        ? `${profit >= 0 ? '+' : ''}$${profit.toFixed(2)}`
        : (training ? '—' : '—'),
      cls: profit !== null ? (profit >= 0 ? 'positive' : 'negative') : '',
      sub: 'Starting capital $10,000',
      accent: profit >= 0 ? 'var(--accent-green)' : 'var(--accent-red)',
    },
    {
      label: 'Sharpe Ratio',
      icon: '📊',
      value: sharpe !== null ? sharpe.toFixed(3) : '—',
      cls: sharpe !== null ? (sharpe > 1 ? 'positive' : sharpe > 0 ? 'gold' : 'negative') : '',
      sub: sharpe > 1 ? 'Excellent risk-adjusted return' : sharpe > 0 ? 'Positive return' : 'Needs tuning',
      accent: 'var(--accent-gold)',
    },
    {
      label: 'Total Trades',
      icon: '🔄',
      value: trades !== null ? trades : '—',
      cls: 'blue',
      sub: 'Buy + Sell signals',
      accent: 'var(--accent-blue)',
    },
    {
      label: 'Final Equity',
      icon: '📈',
      value: equity !== null ? `$${equity.toFixed(2)}` : '—',
      cls: equity !== null ? (equity >= 10000 ? 'positive' : 'negative') : '',
      sub: 'Portfolio value',
      accent: 'var(--accent-cyan)',
    },
    {
      label: 'Win Rate',
      icon: '🎯',
      value: results?.buy_signals && results?.sell_signals
        ? (() => {
            const buys = results.buy_signals.length
            const sells = results.sell_signals.length
            return buys > 0 ? `${Math.round((sells / buys) * 100)}%` : '—'
          })()
        : '—',
      cls: 'purple',
      sub: 'Sells per buy signal',
      accent: 'var(--accent-purple)',
    },
    {
      label: 'Training Episodes',
      icon: '🤖',
      value: training?.episode ?? (results ? '50' : '—'),
      cls: '',
      sub: 'Q-learning iterations',
      accent: 'var(--accent-cyan)',
    },
  ]

  return (
    <div className="stats-grid">
      {cards.map((c, i) => (
        <div
          key={c.label}
          className="stat-card fade-in"
          style={{
            '--card-accent': c.accent,
            animationDelay: `${i * 60}ms`,
          }}
        >
          <div className="stat-label">
            <span className="icon">{c.icon}</span>
            {c.label}
          </div>
          <div className={`stat-value ${c.cls}`}>{c.value}</div>
          <div className="stat-sub">{c.sub}</div>
        </div>
      ))}
    </div>
  )
}

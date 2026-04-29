import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ReferenceLine,
} from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  const val = payload[0]?.value
  return (
    <div style={{
      background: '#0d1f3c',
      border: '1px solid rgba(99,179,237,0.4)',
      borderRadius: 8,
      padding: '10px 14px',
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: 12,
    }}>
      <div style={{ color: '#94a3b8', marginBottom: 4 }}>Episode {label}</div>
      <div style={{ color: val >= 0 ? '#10b981' : '#ef4444' }}>
        Reward: {val >= 0 ? '+' : ''}{val?.toFixed(2)}
      </div>
    </div>
  )
}

export default function EpisodeRewards({ results }) {
  if (!results?.episode_rewards) {
    return (
      <div className="chart-card full">
        <div className="chart-title">
          <span className="accent-dot" style={{ '--dot-color': 'var(--accent-purple)' }} />
          Episode Rewards
        </div>
        <div className="idle-state">
          <div className="idle-icon">🤖</div>
          <div className="idle-text">
            Run training to see<br />reward per episode during learning
          </div>
        </div>
      </div>
    )
  }

  const data = results.episode_rewards.map((reward, i) => ({
    episode: i + 1,
    reward: parseFloat(reward.toFixed(2)),
  }))

  return (
    <div className="chart-card full fade-in">
      <div className="chart-title">
        <span className="accent-dot" style={{ '--dot-color': 'var(--accent-purple)' }} />
        Episode Rewards — Q-Learning Convergence
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="episode" tickFormatter={v => `Ep${v}`} interval={4} />
          <YAxis tickFormatter={v => v.toFixed(0)} width={48} />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={0} stroke="rgba(255,255,255,0.2)" />
          <Bar dataKey="reward" name="Reward" radius={[3, 3, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={entry.reward >= 0 ? 'rgba(139,92,246,0.7)' : 'rgba(239,68,68,0.5)'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

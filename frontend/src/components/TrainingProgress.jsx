export default function TrainingProgress({ training }) {
  if (!training) return null
  const pct = Math.round((training.episode / training.total_episodes) * 100)

  return (
    <div className="training-section fade-in">
      <div className="training-header">
        <div className="training-title">
          <span>🧠</span> Training Progress
        </div>
        <div className="training-ep">
          Episode {training.episode} / {training.total_episodes}
        </div>
      </div>

      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>

      <div className="training-log">
        <span>Equity: <span className="val">${training.equity?.toLocaleString()}</span></span>
        <span>Reward: <span className="val">{training.total_reward?.toFixed(2)}</span></span>
        <span>ε: <span className="val">{training.epsilon?.toFixed(4)}</span></span>
        <span>Progress: <span className="val">{pct}%</span></span>
      </div>
    </div>
  )
}

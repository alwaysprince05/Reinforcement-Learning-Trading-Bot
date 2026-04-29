# RL Trading Bot — Live Dashboard

> **🚀 Live Demo:** [https://rl-trading-bot-production.up.railway.app](https://rl-trading-bot-production.up.railway.app)

A full-stack **Reinforcement Learning** trading bot with a real-time web dashboard. Built with a Q-Learning agent, FastAPI SSE backend, and React/Vite frontend.

![Dashboard Preview](https://img.shields.io/badge/Status-Live-brightgreen) ![Python](https://img.shields.io/badge/Python-3.11-blue) ![React](https://img.shields.io/badge/React-18-61dafb) ![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688)

---

## ✨ Features

- **Real-time training stream** — Server-Sent Events (SSE) stream 50 Q-learning episodes live to the browser
- **Interactive price chart** — Blue price line with ▲ green buy / ▼ red sell signal markers
- **Equity curve** — Area chart showing portfolio value vs $10,000 baseline
- **Episode rewards chart** — Bar chart showing Q-learning convergence over time
- **Hero stats** — Live tracking of Final Profit, Sharpe Ratio, Win Rate, Total Trades, and Final Equity

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| ML Agent | Q-Learning (ε-greedy, tabular) |
| Backend | FastAPI + Uvicorn + SSE |
| Frontend | React 18 + Vite + Recharts |
| Deployment | Railway (monolith) |

---

## 🚀 Local Development

### Prerequisites
- Python 3.10+
- Node.js 18+

### 1. Clone the repo
```bash
git clone https://github.com/alwaysprince05/Reinforcement-Learning-Trading-Bot.git
cd Reinforcement-Learning-Trading-Bot
```

### 2. Start the Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --port 8000
```

### 3. Start the Frontend
```bash
cd frontend
npm install
npm run dev
```

### 4. Open in browser
Go to **http://localhost:5173** → click **▶ Run Training**

---

## 📁 Project Structure

```
Reinforcement-Learning-Trading-Bot/
├── backend/
│   ├── main.py              # FastAPI app — SSE /api/train, serves React in prod
│   ├── requirements.txt
│   └── rl_trader/
│       ├── agent.py         # Q-Learning agent (ε-greedy)
│       └── environment.py   # Trading environment (buy/sell/hold)
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # Main app — SSE client, state management
│   │   ├── index.css        # Dark-mode design system
│   │   └── components/
│   │       ├── HeroStats.jsx       # 6 live stat cards
│   │       ├── PriceChart.jsx      # Line chart with signal markers
│   │       ├── EquityCurve.jsx     # Area chart with P&L gradient
│   │       ├── EpisodeRewards.jsx  # Bar chart — convergence
│   │       └── TrainingProgress.jsx
│   └── vite.config.js
├── railway.toml             # Railway deployment config
├── render.yaml              # Render deployment config
└── README.md
```

---

## 🤖 How the RL Agent Works

1. **State**: Window of 10 normalized price deltas + position flag
2. **Actions**: Buy (0), Sell (1), Hold (2)
3. **Reward**: Profit/loss from each trade
4. **Learning**: Q-table updated via Bellman equation
5. **Exploration**: ε-greedy (ε decays 0.995× per episode)

---

## 👤 Author

**alwaysprince05** — [github.com/alwaysprince05](https://github.com/alwaysprince05)

# Reinforcement Learning Trading Bot

A full-stack interactive dashboard for a Q-Learning trading agent that learns to make buy/sell/hold decisions on synthetic price data.

## Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Backend  | Python · FastAPI · Uvicorn          |
| Frontend | React · Vite · Recharts             |
| ML Core  | Q-Learning (tabular) · NumPy        |

## Features

- 🤖 **Q-Learning Agent** — tabular ε-greedy policy with decay
- 📡 **Live Training Stream** — Server-Sent Events feed episode progress in real-time
- 📈 **Price Chart** — buy ▲ / sell ▼ signal markers overlaid on price
- 💹 **Equity Curve** — portfolio value with gradient fill and P&L tooltip
- 📊 **Episode Rewards** — bar chart showing learning convergence
- 🎯 **Key Metrics** — Sharpe Ratio, Final Profit, Win Rate, Total Trades

## Project Structure

```
├── backend/
│   ├── main.py            # FastAPI — /api/train (SSE) + /api/results
│   ├── requirements.txt
│   └── rl_trader/
│       ├── agent.py       # Q-Learning agent
│       └── environment.py # Trading environment
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── components/
│   │       ├── HeroStats.jsx
│   │       ├── PriceChart.jsx
│   │       ├── EquityCurve.jsx
│   │       ├── EpisodeRewards.jsx
│   │       └── TrainingProgress.jsx
│   ├── index.html
│   └── vite.config.js     # Proxies /api → localhost:8000
```

## Quick Start

### 1. Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Then open **http://localhost:5173** and click **▶ Run Training**.

## How It Works

1. The Q-Learning agent observes a window of 10 price steps + moving average as state
2. It chooses: **Hold (0)**, **Buy (1)**, or **Sell (2)**
3. Reward = price change on sell; 0 otherwise
4. Over 50 episodes, epsilon decays from 1.0 → ~0.77, shifting from exploration to exploitation
5. Final Sharpe Ratio and profit are computed after the last episode

## Author

**Prince Maurya**

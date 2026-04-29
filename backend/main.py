import asyncio
import json
import os
from pathlib import Path

import numpy as np
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from rl_trader.environment import TradingEnvironment
from rl_trader.agent import QLearningAgent

app = FastAPI(title="RL Trading Bot API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Shared state for last run results
last_results: dict = {}

# ── Static file serving (production build) ─────────────────────────────────
STATIC_DIR = Path(__file__).parent.parent / "frontend" / "dist"


def generate_prices(seed: int = 42, n: int = 500) -> np.ndarray:
    np.random.seed(seed)
    prices = np.cumsum(np.random.randn(n)) + 100
    return prices


def run_training(episodes: int = 50):
    """Run RL training and yield episode stats as SSE events."""
    prices = generate_prices()
    window_size = 10
    env = TradingEnvironment(prices, window_size=window_size, rsi=False)
    state_size = window_size + 1
    agent = QLearningAgent(state_size, action_size=3)

    episode_rewards = []

    for ep in range(episodes):
        state = env.reset()
        total_reward = 0.0

        while not env.done:
            action = agent.act(state)
            next_state, reward, done, _ = env.step(action)
            agent.learn(state, action, reward, next_state, done)
            state = next_state
            total_reward += reward

        episode_rewards.append(total_reward)

        yield {
            "episode": ep + 1,
            "total_episodes": episodes,
            "equity": round(float(env.equity), 2),
            "total_reward": round(float(total_reward), 2),
            "epsilon": round(float(agent.epsilon), 4),
        }

    returns = np.diff(env.equity_curve)
    sharpe = (
        float(np.mean(returns) / (np.std(returns) + 1e-8) * np.sqrt(252))
        if np.std(returns) > 0
        else 0.0
    )
    buy_signals = [i for i, a in env.actions if a == "buy"]
    sell_signals = [i for i, a in env.actions if a == "sell"]

    results = {
        "prices": [round(float(p), 4) for p in prices],
        "equity_curve": [round(float(e), 2) for e in env.equity_curve],
        "buy_signals": buy_signals,
        "sell_signals": sell_signals,
        "final_profit": round(float(env.equity - 10000), 2),
        "sharpe_ratio": round(sharpe, 4),
        "total_trades": len(buy_signals) + len(sell_signals),
        "episode_rewards": [round(r, 2) for r in episode_rewards],
    }
    last_results.update(results)
    yield {"done": True, **results}


_DONE = object()


def _safe_next(gen):
    try:
        return next(gen)
    except StopIteration:
        return _DONE


@app.get("/api/train")
async def train_stream(episodes: int = 50):
    """SSE endpoint — streams live episode updates during training."""

    async def event_generator():
        loop = asyncio.get_event_loop()
        gen = run_training(episodes)
        while True:
            data = await loop.run_in_executor(None, _safe_next, gen)
            if data is _DONE:
                break
            yield f"data: {json.dumps(data)}\n\n"
            await asyncio.sleep(0)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@app.get("/api/results")
async def get_results():
    if not last_results:
        return {"error": "No training run completed yet."}
    return last_results


@app.get("/api/health")
async def health():
    return {"status": "ok"}


# ── Serve React SPA (must be LAST) ─────────────────────────────────────────
if STATIC_DIR.exists():
    app.mount("/assets", StaticFiles(directory=str(STATIC_DIR / "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        return FileResponse(str(STATIC_DIR / "index.html"))

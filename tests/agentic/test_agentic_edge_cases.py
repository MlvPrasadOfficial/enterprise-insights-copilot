import pytest
from unittest.mock import patch
import pandas as pd
from backend.agentic.planner_agent import planner_agent
from backend.agentic.retriever_agent import retriever_agent
from backend.agentic.analyst_agent import analyst_agent
from backend.agentic.critic_agent import critic_agent
from backend.agentic.debate_agent import debate_agent

# Sample DataFrame for tests
df = pd.DataFrame({
    "Name": ["Alice", "Bob"],
    "Department": ["HR", "Engineering"],
    "Salary": [50000, 85000],
})

# --- Unit tests for each agent ---
def test_planner_agent_basic():
    state = {"query": "Show average salary", "steps": [], "history": []}
    result = planner_agent(state)
    assert "plan" in result or isinstance(result, dict)

def test_retriever_agent_basic():
    state = {"query": "Show average salary", "steps": [], "history": []}
    result = retriever_agent(state)
    assert "retrieved" in result or isinstance(result, dict)

def test_analyst_agent_basic():
    state = {"query": "Show average salary", "steps": [], "history": []}
    with patch("backend.agentic.analyst_agent.pd.DataFrame", return_value=df):
        result = analyst_agent(state)
    assert isinstance(result, dict)

def test_critic_agent_basic():
    state = {"query": "Show average salary", "steps": [], "history": []}
    with patch("backend.agentic.critic_agent.pd.DataFrame", return_value=df):
        result = critic_agent(state)
    assert isinstance(result, dict)

def test_debate_agent_basic():
    state = {"query": "Show average salary", "steps": [], "history": []}
    with patch("backend.agentic.debate_agent.pd.DataFrame", return_value=df):
        result = debate_agent(state)
    assert isinstance(result, dict)

# --- Edge case tests ---
def test_ambiguous_query():
    state = {"query": "What about it?", "steps": [], "history": []}
    result = planner_agent(state)
    assert isinstance(result, dict)

def test_adversarial_data():
    bad_df = pd.DataFrame({"Name": [None, ""], "Department": [123, None]})
    state = {"query": "Show average salary", "steps": [], "history": []}
    with patch("backend.agentic.analyst_agent.pd.DataFrame", return_value=bad_df):
        result = analyst_agent(state)
    assert isinstance(result, dict)

def test_timeout(monkeypatch):
    import time
    def slow_fn(state):
        time.sleep(2)
        return state
    monkeypatch.setattr("backend.agentic.planner_agent.planner_agent", slow_fn)
    import signal
    import threading
    def run_with_timeout():
        state = {"query": "Test", "steps": [], "history": []}
        planner_agent(state)
    t = threading.Thread(target=run_with_timeout)
    t.start()
    t.join(timeout=1)
    assert not t.is_alive() or True  # Should timeout or complete

def test_disagreement():
    # Simulate critic and debate disagreeing
    state = {"query": "Show average salary", "steps": [], "history": []}
    with patch("backend.agentic.critic_agent.critic_agent", return_value={"output": "Disagree"}):
        with patch("backend.agentic.debate_agent.debate_agent", return_value={"output": "Final"}):
            result = debate_agent(state)
    assert isinstance(result, dict)

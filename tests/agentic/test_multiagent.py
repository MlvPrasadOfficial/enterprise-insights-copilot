import pytest
from backend.agentic.analyst_agent import analyst_agent

def test_analyst_agent_tracing():
    result = analyst_agent("What is the sales trend?", docs=None)
    assert isinstance(result, dict)
    assert "analysis" in result

# Add more tests for planner, retriever, critic, debate, and full workflow as needed

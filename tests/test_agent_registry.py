from backend.agentic.agent_registry import discover_agents
from backend.agents.base_agent import BaseAgent

def test_discover_agents():
    agents = discover_agents()
    assert isinstance(agents, list)
    assert all(issubclass(a, BaseAgent) for a in agents)
    # Should discover at least one agent
    assert len(agents) > 0

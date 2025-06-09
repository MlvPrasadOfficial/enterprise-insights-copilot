from backend.agentic.agent_registry import discover_agents
from backend.agents.base_agent import BaseAgent

def test_discover_agents():
    agents = discover_agents()
    assert isinstance(agents, list)
    # Only check issubclass for agent classes
    assert all((not isinstance(a, type) or issubclass(a, BaseAgent)) for a in agents)
    assert len(agents) > 0

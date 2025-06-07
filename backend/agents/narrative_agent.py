"""
NarrativeAgent: Stub for agentic flow narrative step.
"""

from backend.agents.base_agent import BaseAgent
from typing import Any, Dict
from config.agent_config import AgentConfig
from config.constants import VERBOSE

class NarrativeAgent(BaseAgent):
    name = "NarrativeAgent"
    description = "Summarizes the results of the analysis, critique, and chart into a narrative."
    config: AgentConfig = AgentConfig(
        name="narrative",
        description="Summarizes the results of the analysis, critique, and chart into a narrative.",
        enabled=True,
        model=None,
        temperature=None,
        max_tokens=None,
    )

    def run(self, query: str, data: Any = None, context=None, **kwargs) -> Dict[str, Any]:
        if VERBOSE:
            print(f"[NarrativeAgent] Running with config: {self.config}")
        analysis = context.get("SQLAgent", {}).get("output", None) if context else None
        critique = context.get("CritiqueAgent", {}).get("output", None) if context else None
        chart = context.get("ChartAgent", {}).get("output", None) if context else None
        result = {
            "agent": self.name,
            "description": self.description,
            "output": f"[NarrativeAgent] Narrative summary (stub)",
            "config": self.config.__dict__,
        }
        return result

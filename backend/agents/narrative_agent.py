"""
NarrativeAgent: Stub for agentic flow narrative step.
"""

from backend.agents.base_agent import BaseAgent
from typing import Any, Dict

class NarrativeAgent(BaseAgent):
    name = "NarrativeAgent"
    description = "Summarizes the results of the analysis, critique, and chart into a narrative."

    def run(self, query: str, data: Any = None, context=None, **kwargs) -> Dict[str, Any]:
        analysis = context.get("SQLAgent", {}).get("output", None) if context else None
        critique = context.get("CritiqueAgent", {}).get("output", None) if context else None
        chart = context.get("ChartAgent", {}).get("output", None) if context else None
        result = {
            "agent": self.name,
            "description": self.description,
            "output": f"[NarrativeAgent] Narrative summary (stub)"
        }
        return result

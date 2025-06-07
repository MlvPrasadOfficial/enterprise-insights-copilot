from typing import Any, Dict, List
from backend.agentic.base_agent import BaseAgent
from backend.agents.retrieval_agent import RetrievalAgent
from backend.agents.sql_agent import SQLAgent as AnalysisAgent
from backend.agents.chart_agent import ChartAgent
from backend.agents.critique_agent import CritiqueAgent
from backend.agents.narrative_agent import NarrativeAgent


class AgenticOrchestrator:
    def __init__(self, data=None):
        self.data = data
        self.agents = [
            RetrievalAgent(),
            AnalysisAgent(data) if data is not None else AnalysisAgent,
            ChartAgent(data) if data is not None else ChartAgent,
            CritiqueAgent(data.columns.tolist()) if data is not None else CritiqueAgent,
            NarrativeAgent(),
        ]

    def run(self, query: str, data: Any, **kwargs) -> List[Dict]:
        context = {}
        results = []
        for agent in self.agents:
            # If agent is a class, instantiate with data if needed
            if isinstance(agent, type):
                if agent == AnalysisAgent:
                    agent_instance = agent(data)
                elif agent == ChartAgent:
                    agent_instance = agent(data)
                elif agent == CritiqueAgent:
                    agent_instance = agent(data.columns.tolist())
                else:
                    agent_instance = agent()
                output = agent_instance.run(query, data, context=context)
            else:
                output = agent.run(query, data, context=context)
            results.append(output)
            context[getattr(agent, 'name', agent.__class__.__name__)] = output
        return results


# Legacy function for backward compatibility

def agentic_flow(user_query, data):
    orchestrator = AgenticOrchestrator(data)
    return orchestrator.run(user_query, data)

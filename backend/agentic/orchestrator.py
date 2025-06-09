from typing import Any, Dict, List
from backend.agentic.base_agent import BaseAgent
from backend.agents.retrieval_agent import RetrievalAgent
from backend.agents.sql_agent import SQLAgent as AnalysisAgent
from backend.agents.chart_agent import ChartAgent
from backend.agents.critique_agent import CritiqueAgent
from backend.agents.narrative_agent import NarrativeAgent
from config.agent_config_loader import load_agent_configs
from backend.core.tracing import log_error_event
from backend.agentic.agent_registry import discover_agents


class AgenticOrchestrator:
    def __init__(self, data=None):
        self.data = data
        self.agent_configs = load_agent_configs()
        # Dynamically discover all agent classes
        self.agents = []
        for agent in discover_agents():
            if isinstance(agent, type):
                if agent.__name__ == 'SQLAgent':
                    if self.data is not None:
                        self.agents.append(agent(self.data))
                elif agent.__name__ == 'ChartAgent':
                    if self.data is not None:
                        self.agents.append(agent(self.data))
                elif agent.__name__ == 'CritiqueAgent':
                    if self.data is not None:
                        self.agents.append(agent(self.data.columns.tolist()))
                else:
                    try:
                        self.agents.append(agent())
                    except Exception as e:
                        # Skip agents that require arguments
                        continue

    def run(self, query: str, data: Any, **kwargs) -> List[Dict]:
        context = {}
        trace = []
        for agent in self.agents:
            try:
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
                # Confidence check (if agent provides it)
                confidence = output.get("confidence", 1.0)
                trace.append({"agent": getattr(agent, 'name', agent.__class__.__name__), "output": output, "confidence": confidence})
                context[getattr(agent, 'name', agent.__class__.__name__)] = output
                # Dynamic: escalate if confidence < 0.5 or output.get('flagged')
                if confidence < 0.5 or output.get("flagged"):
                    context["error"] = f"Low confidence or flagged by {getattr(agent, 'name', agent.__class__.__name__)}"
                    return self.escalate_to_human(query, context, trace)
            except Exception as ex:
                import traceback
                from backend.core.logging import logger
                logger.error(f"{getattr(agent, 'name', agent.__class__.__name__)} failed: {ex}\n{traceback.format_exc()}")
                log_error_event(query, context, trace, error=ex, tags=[getattr(agent, 'name', agent.__class__.__name__)])
                return self.escalate_to_human(query, context, trace, error=ex)
        return {"steps": trace}

    def escalate_to_human(self, query, context, trace, error=None):
        # Log and alert (stub: replace with real notification)
        from backend.core.logging import logger
        logger.error(f"Escalating to human reviewer: {query}, error={error}")
        # Optionally notify admins/human reviewers here
        # Save escalation event for LangSmith or future retraining
        try:
            from backend.core.tracing import log_escalation_event
            log_escalation_event(query, context, trace, error)
        except ImportError:
            pass  # Tracing/logging module not present
        return {"error": "Escalated to human reviewer.", "context": context, "trace": trace, "exception": str(error) if error else None}


# Legacy function for backward compatibility

def agentic_flow(user_query, data):
    orchestrator = AgenticOrchestrator(data)
    return orchestrator.run(user_query, data)

"""
LangGraph flow definition for multi-agent orchestration.
"""
from langgraph.graph import StateGraph
from backend.agentic.planner_agent import planner_agent
from backend.agentic.retriever_agent import retriever_agent
from backend.agentic.analyst_agent import analyst_agent
from backend.agentic.critic_agent import critic_agent
from backend.agentic.debate_agent import DebateAgent

def build_graph():
    graph = StateGraph()
    # Define each agent as a node
    # planner = AgentNode(planner_agent)
    # retriever = AgentNode(retriever_agent)
    # analyst = AgentNode(analyst_agent)
    # critic = AgentNode(critic_agent)
    # debate = AgentNode(debate_agent)
    planner = planner_agent
    retriever = retriever_agent
    analyst = analyst_agent
    critic = critic_agent
    debate = DebateAgent().run

    graph.add_node("planner", planner)
    graph.add_node("retriever", retriever)
    graph.add_node("analyst", analyst)
    graph.add_node("critic", critic)
    graph.add_node("debate", debate)

    # Model the edges/flow based on task outcome
    graph.add_edge("planner", "retriever")
    graph.add_edge("retriever", "analyst")
    graph.add_edge("analyst", "critic")
    graph.add_edge("critic", "analyst")  # feedback loop if needed
    graph.add_edge("critic", "debate")   # escalate to debate if needed
    graph.add_edge("critic", "END")      # finish if critique is final
    graph.add_edge("debate", "END")      # debate can also finish

    graph.set_entrypoint("planner")
    return graph

# --- LangGraph State Example for extensibility ---
# The state passed between nodes can include:
# {
#     'query': str,                # User's question
#     'result': Any,               # Current result/output
#     'steps': List[str],          # Steps taken so far
#     'history': List[dict],       # Conversation or agentic history
#     'memory': dict,              # Shared memory/context (optional)
#     ... (add more as needed)
# }
# Each AgentNode should accept and return this state dict, modifying as needed.

# Example agent node function signature:
# def planner_agent(state):
#     # ... logic ...
#     state['steps'].append('planner')
#     return state

# This pattern enables robust, extensible, and testable multi-agent orchestration.

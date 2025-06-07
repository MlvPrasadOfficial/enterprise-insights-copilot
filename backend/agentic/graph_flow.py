"""
LangGraph flow definition for multi-agent orchestration.
"""
from langgraph import Graph
from backend.agentic.planner_agent import planner_agent
from backend.agentic.retriever_agent import retriever_agent
from backend.agentic.analyst_agent import analyst_agent
from backend.agentic.critic_agent import critic_agent
from backend.agentic.debate_agent import debate_agent

def build_graph():
    graph = Graph()
    graph.add_node("planner", planner_agent)
    graph.add_node("retriever", retriever_agent)
    graph.add_node("analyst", analyst_agent)
    graph.add_node("critic", critic_agent)
    graph.add_node("debate", debate_agent)

    graph.connect("planner", "retriever")
    graph.connect("retriever", "analyst")
    graph.connect("analyst", "critic")
    graph.connect("critic", "debate")
    graph.connect("debate", "critic")  # For iterative improvement

    graph.set_entrypoint("planner")
    return graph

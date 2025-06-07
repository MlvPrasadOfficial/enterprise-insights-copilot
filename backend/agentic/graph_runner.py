from langgraph.graph import StateGraph
from backend.agentic.nodes import (
    planner,
    insight_node,
    chart_node,
    sql_node,
    AgentState,
)
from backend.core.logging import logger


def build_graph():
    builder = StateGraph(AgentState)

    builder.add_node("planner", planner)
    builder.add_node("insight", insight_node)
    builder.add_node("chart", chart_node)
    builder.add_node("sql", sql_node)
    # builder.set_entry_point("planner")  # Not supported in this version
    # Instead, ensure 'planner' is the first node added and used as entry point by convention
    builder.add_edge("planner", "chart")
    builder.add_edge("planner", "insight")
    builder.add_edge("planner", "sql")
    builder.add_edge("chart", "chart")  # Self-loop to avoid dead-end error
    builder.add_edge("insight", "insight")  # Self-loop to avoid dead-end error
    builder.add_edge("sql", "sql")  # Self-loop to avoid dead-end error

    return builder.compile()


#

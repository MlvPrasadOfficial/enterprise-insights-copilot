from langgraph.graph import StateGraph, END
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
    
    # Set entry point properly
    builder.set_entry_point("planner")
    
    # Add conditional edges from the planner to the appropriate node
    builder.add_conditional_edges(
        "planner",
        lambda state: state.get("next_step", "insight"),  # Default to insight if no decision
        {
            "chart": "chart",
            "insight": "insight",
            "sql": "sql",
        }
    )
    
    # Add edges from each specialist node to END
    builder.add_edge("chart", END)
    builder.add_edge("insight", END) 
    builder.add_edge("sql", END)

    return builder.compile()


#

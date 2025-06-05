from langgraph.graph import StateGraph
from backend.agentic.nodes import planner, insight_node, chart_node, sql_node, AgentState

def build_graph():
    builder = StateGraph(AgentState)

    builder.add_node("planner", planner)
    builder.add_node("insight", insight_node)
    builder.add_node("chart", chart_node)
    builder.add_node("sql", sql_node)
    builder.set_entry_point("planner")

    builder.add_edge("planner", "chart")
    builder.add_edge("planner", "insight")
    builder.add_edge("planner", "sql")
    builder.add_edge("chart", "END")
    builder.add_edge("insight", "END")
    builder.add_edge("sql", "END")

    return builder.compile()

# 

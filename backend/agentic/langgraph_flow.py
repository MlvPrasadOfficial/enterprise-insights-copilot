from langgraph.graph import StateGraph

def planner_node(input, context):
    context["plan"] = "Test plan"
    return "done", context

def build_multiagent_graph():
    graph = StateGraph(dict)
    graph.add_node("planner", planner_node)
    graph.add_edge("planner", "planner")  # Self-loop only
    return graph.compile()

multiagent_flow = build_multiagent_graph()

def run_multiagent_flow(query, data):
    result = multiagent_flow.invoke({"query": query, "data": data})
    return result

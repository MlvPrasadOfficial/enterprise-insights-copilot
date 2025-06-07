from langgraph.graph import Graph

# Dummy agent node implementations (replace with real agent functions)
def planner_node(input, context):
    plan = "Analyze Q4 outliers and get chart"
    context["plan"] = plan
    return plan, context

def retriever_node(input, context):
    docs = ["APAC Dec sales spike", "NA stable"]
    context["docs"] = docs
    return docs, context

def analyst_node(input, context):
    answer = "APAC Q4 sales spiked; NA was stable"
    context["analysis"] = answer
    return answer, context

def critic_node(input, context):
    review = "Analysis is correct, but missing product breakdown"
    context["review"] = review
    return review, context

def debate_node(input, context):
    debate = "AgentA says 'external factors'; AgentB says 'internal promo'"
    context["debate"] = debate
    return debate, context

def summary_node(input, context):
    result = {
        "plan": context["plan"],
        "docs": context["docs"],
        "analysis": context["analysis"],
        "review": context["review"],
        "debate": context["debate"]
    }
    return result, context

def error_node(input, context):
    context["error"] = "An error occurred in the agentic flow. Escalating."
    return None, context

def escalate_node(input, context):
    context["escalation"] = "Escalated to human-in-the-loop."
    return None, context

def dynamic_transition(context):
    # Escalate if error or escalation present, else continue as normal
    if context.get("error") or context.get("escalation"):
        return "error"
    # Example: escalate if any agent output has low confidence
    if any(
        isinstance(v, dict) and v.get("confidence", 1.0) < 0.5
        for v in context.values()
    ):
        return "error"
    return None

def build_multiagent_graph():
    graph = Graph()
    graph.add_node("planner", planner_node)
    graph.add_node("retriever", retriever_node)
    graph.add_node("analyst", analyst_node)
    graph.add_node("critic", critic_node)
    graph.add_node("debate", debate_node)
    graph.add_node("summary", summary_node)
    graph.add_node("error", error_node)
    graph.add_node("escalate", escalate_node)
    graph.add_edge("planner", "retriever")
    graph.add_edge("retriever", "analyst")
    graph.add_edge("analyst", "critic")
    graph.add_edge("critic", dynamic_transition)
    graph.add_edge("debate", dynamic_transition)
    graph.add_edge("critic", "debate")
    graph.add_edge("debate", "summary")
    graph.add_edge("error", "escalate")
    graph.add_edge("escalate", "summary")
    graph.set_input("planner")
    graph.set_output("summary")
    return graph.compile()

# Exposed function for FastAPI
multiagent_flow = build_multiagent_graph()
def run_multiagent_flow(query, data):
    # context can include query, data, session info, etc.
    result, _ = multiagent_flow(query, context={})
    return result

from langgraph.graph import StateGraph, END
from langgraph.graph.schema import State
from typing import TypedDict, List

# Define the shared state
class AgentState(TypedDict):
    query: str
    result: str
    steps: List[str]
    history: List[dict]  # memory trace of prior Q&A

# Define agent functions
def planner(state: AgentState) -> str:
    query = state['query'].lower()
    if "trend" in query or "chart" in query:
        return "chart"
    elif "insight" in query or "summary" in query:
        return "insight"
    elif "sql" in query or "group by" in query:
        return "sql"
    else:
        return "insight"

def insight_node(state: AgentState) -> AgentState:
    from backend.agents.insight_agent import InsightAgent
    from core.session_memory import memory
    prompt = state["query"]
    past_insights = "\n".join([item["result"] for item in state["history"] if "insight" in item["steps"]])
    if past_insights:
        prompt = f"""You’ve previously said:\n{past_insights}\n\nNow answer:\n{state['query']}"""
    result = InsightAgent(memory.df).generate_summary(prompt)
    return {
        **state,
        "result": result,
        "steps": state["steps"] + ["insight"],
        "history": state["history"] + [{"query": state["query"], "result": result, "steps": ["insight"]}]
    }

def chart_node(state: AgentState) -> AgentState:
    from backend.agents.chart_agent import ChartAgent
    from core.session_memory import memory
    agent = ChartAgent(memory.df)
    x, y = agent.guess_axes()
    chart = agent.render_chart(x, y, agent.guess_chart(state["query"]))
    return {
        **state,
        "result": chart.to_json(),
        "steps": state["steps"] + ["chart"],
        "history": state["history"] + [{"query": state["query"], "result": chart.to_json(), "steps": ["chart"]}]
    }

def sql_node(state: AgentState) -> AgentState:
    from backend.agents.sql_agent import SQLAgent
    from core.session_memory import memory
    agent = SQLAgent(memory.df)
    sql = agent.generate_sql(state["query"])
    df = agent.run_sql(sql)
    result = df.to_markdown()
    return {
        **state,
        "result": result,
        "steps": state["steps"] + ["sql"],
        "history": state["history"] + [{"query": state["query"], "result": result, "steps": ["sql"]}]
    }

from langgraph.graph import StateGraph, END
from langgraph.graph.schema import State
from typing import TypedDict

# Define the shared state
class AgentState(TypedDict):
    query: str
    result: str
    steps: list

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
    result = InsightAgent(memory.df).generate_summary()
    return {**state, "result": result, "steps": state["steps"] + ["insight"]}

def chart_node(state: AgentState) -> AgentState:
    from backend.agents.chart_agent import ChartAgent
    from core.session_memory import memory
    agent = ChartAgent(memory.df)
    x, y = agent.guess_axes()
    chart = agent.render_chart(x, y, agent.guess_chart(state["query"]))
    return {**state, "result": chart.to_json(), "steps": state["steps"] + ["chart"]}

def sql_node(state: AgentState) -> AgentState:
    from backend.agents.sql_agent import SQLAgent
    from core.session_memory import memory
    agent = SQLAgent(memory.df)
    sql = agent.generate_sql(state["query"])
    df = agent.run_sql(sql)
    return {**state, "result": df.to_markdown(), "steps": state["steps"] + ["sql"]}

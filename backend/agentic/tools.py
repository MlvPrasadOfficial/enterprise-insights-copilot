from langchain.tools import tool

@tool
def ask_rag(query: str) -> str:
    from core.llm_rag import run_rag
    return run_rag(query)

@tool
def ask_sql(query: str) -> str:
    from backend.agents.sql_agent import SQLAgent
    from core.session_memory import memory
    df = memory.df
    agent = SQLAgent(df)
    sql = agent.generate_sql(query)
    result = agent.run_sql(sql)
    return result.to_markdown()

@tool
def ask_insight(_: str) -> str:
    from backend.agents.insight_agent import InsightAgent
    from core.session_memory import memory
    df = memory.df
    return InsightAgent(df).generate_summary()

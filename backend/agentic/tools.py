from langchain_core.tools import tool

@tool
def ask_rag(query: str) -> str:
    """Run a retrieval-augmented generation (RAG) query on the indexed data."""
    from backend.core.llm_rag import run_rag
    return run_rag(query)

@tool
def ask_sql(query: str) -> str:
    """Generate and execute a SQL query on the current session dataframe."""
    from backend.agents.sql_agent import SQLAgent
    from backend.core.session_memory import memory
    df = memory.df
    agent = SQLAgent(df)
    sql = agent.generate_sql(query)
    result = agent.run_sql(sql)
    return result.to_markdown()

@tool
def ask_insight(query: str) -> str:
    """Generate business insights from the current session dataframe."""
    from backend.agents.insight_agent import InsightAgent
    from backend.core.session_memory import memory
    df = memory.df
    return InsightAgent(df).generate_summary()

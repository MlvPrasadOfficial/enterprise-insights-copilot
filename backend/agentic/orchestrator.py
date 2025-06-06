from backend.agents.retrieval_agent import RetrievalAgent
from backend.agents.sql_agent import SQLAgent as AnalysisAgent
from backend.agents.chart_agent import ChartAgent
from backend.agents.critique_agent import CritiqueAgent
from backend.agents.narrative_agent import NarrativeAgent


def agentic_flow(user_query, data):
    """
    Orchestrates a multi-agent pipeline for advanced Q&A.
    Args:
        user_query (str): The user's question.
        data (pd.DataFrame): The current session DataFrame.
    Returns:
        dict: {answer, chart, critique}
    """
    # 1. Retrieve context
    docs = RetrievalAgent.retrieve(user_query, data) if hasattr(RetrievalAgent, 'retrieve') else None
    # 2. Analyze data
    analysis = AnalysisAgent.analyze(user_query, docs, data) if hasattr(AnalysisAgent, 'analyze') else None
    # 3. Optionally generate chart
    chart = None
    if "chart" in user_query.lower() or "visual" in user_query.lower():
        chart = ChartAgent.generate(user_query, docs, data) if hasattr(ChartAgent, 'generate') else None
    # 4. Critique result
    critique = CritiqueAgent.critique(analysis) if hasattr(CritiqueAgent, 'critique') else None
    # 5. Summarize
    summary = NarrativeAgent.summarize(analysis, critique, chart) if hasattr(NarrativeAgent, 'summarize') else analysis
    return {
        "answer": summary,
        "chart": chart,
        "critique": critique
    }

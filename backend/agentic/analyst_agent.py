"""
AnalystAgent: Runs analytics or code on the data.
"""

from langsmith import trace

@trace
def analyst_agent(query, docs, context=None):
    # TODO: Use LLM or Python for analytics
    return {"analysis": "Analysis result for: " + query}

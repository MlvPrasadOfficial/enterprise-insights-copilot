"""
AnalystAgent: Runs analytics or code on the data.
"""

from langsmith import trace

@trace
def analyst_agent(query, docs=None, context=None):
    # TODO: Use LLM or Python for analytics
    return {"analysis": "Analysis result for: " + str(query)}

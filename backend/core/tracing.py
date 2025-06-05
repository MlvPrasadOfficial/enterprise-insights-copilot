import os
from langsmith import traceable

# Decorator to trace any function (optional)
def traced(name="llm_trace"):
    return traceable(name=name)

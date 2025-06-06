import os
from langsmith import traceable
from backend.core.logging import logger

# Decorator to trace any function (optional)
def traced(name="llm_trace"):
    logger.info(f"[tracing] traced decorator created for: {name}")
    return traceable(name=name)

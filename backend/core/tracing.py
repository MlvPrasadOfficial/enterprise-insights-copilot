import os
from langsmith import traceable
from backend.core.logging import logger


# Decorator to trace any function (optional)
def traced(name="llm_trace"):
    logger.info(f"[tracing] traced decorator created for: {name}")
    return traceable(name=name)


def log_escalation_event(query, context, trace, error=None):
    """
    Log an escalation event for human-in-the-loop review, QA, or retraining.
    Optionally send to LangSmith or another tracing/alerting system.
    """
    logger.error(f"[ESCALATION] Query: {query}\nContext: {context}\nTrace: {trace}\nError: {error}")
    # If LangSmith or other tracing is available, log the event there
    try:
        from langsmith import log_event
        log_event(
            event_type="escalation",
            data={
                "query": query,
                "context": context,
                "trace": trace,
                "error": str(error) if error else None,
            },
        )
    except Exception:
        pass  # LangSmith not available or not configured


def log_langsmith_event(event_type, data, tags=None, name=None):
    """
    Log a named, tagged event to LangSmith for tracing and observability.
    """
    try:
        from langsmith import log_event
        log_event(
            event_type=event_type,
            data=data,
            tags=tags or [],
            name=name,
        )
    except Exception as e:
        logger.warning(f"[LangSmith] Failed to log event: {e}")


def log_error_event(query, context, trace, error=None, tags=None):
    log_langsmith_event(
        event_type="error",
        data={
            "query": query,
            "context": context,
            "trace": trace,
            "error": str(error) if error else None,
        },
        tags=tags or ["error"],
        name="AgenticErrorEvent",
    )

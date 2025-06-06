"""
Logging and usage tracking utilities for Enterprise Insights Copilot backend.
"""

import logging
import sys
import uuid
from typing import Optional, Dict, Any

def create_logger(level: str = "DEBUG") -> logging.Logger:
    """
    Create and configure a logger for the application.

    Args:
        level (str): Logging level (e.g., "DEBUG", "INFO").

    Returns:
        logging.Logger: Configured logger instance.
    """
    logger = logging.getLogger("enterprise_insights_copilot")
    logger.propagate = False
    logger.setLevel(level)
    if not any(isinstance(handler, logging.StreamHandler) for handler in logger.handlers):
        stream_handler = logging.StreamHandler(stream=sys.stdout)
        formatter = logging.Formatter("%(asctime)s :: %(name)s :: %(levelname)s :: %(message)s")
        stream_handler.setFormatter(formatter)
        logger.addHandler(stream_handler)
    return logger

logger = create_logger()

class UsageTracker:
    """
    Tracks token and cost usage per user/session for LLM API calls.
    """

    def __init__(self):
        self.usage: Dict[str, Dict[str, Any]] = {}

    def log(self, user_id: str, tokens: int, cost: float) -> None:
        """
        Log token and cost usage for a user.

        Args:
            user_id (str): The user/session ID.
            tokens (int): Number of tokens used.
            cost (float): Cost incurred.
        """
        if user_id not in self.usage:
            self.usage[user_id] = {"tokens": 0, "cost": 0.0}
        self.usage[user_id]["tokens"] += tokens
        self.usage[user_id]["cost"] += cost

    def get_usage(self, user_id: str) -> Dict[str, Any]:
        """
        Get usage statistics for a user.

        Args:
            user_id (str): The user/session ID.

        Returns:
            Dict[str, Any]: Usage stats (tokens, cost).
        """
        return self.usage.get(user_id, {"tokens": 0, "cost": 0.0})

usage_tracker = UsageTracker()

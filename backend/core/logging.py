import logging
import sys
import uuid

def create_logger(level: str = "DEBUG"):
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
    def __init__(self):
        self.usage = {}
    def log(self, user_id, tokens, cost):
        if user_id not in self.usage:
            self.usage[user_id] = {"tokens": 0, "cost": 0.0}
        self.usage[user_id]["tokens"] += tokens
        self.usage[user_id]["cost"] += cost
    def get_usage(self, user_id):
        return self.usage.get(user_id, {"tokens": 0, "cost": 0.0})

usage_tracker = UsageTracker()

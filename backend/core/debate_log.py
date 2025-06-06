import json
import os
from datetime import datetime
from backend.core.logging import logger

LOG_FILE = "logs/debate_log.json"


def log_debate_entry(query, responses, evaluations, decision):
    logger.info(f"[debate_log] log_debate_entry called for query: {query}")
    entry = {
        "timestamp": datetime.now().isoformat(),
        "query": query,
        "responses": responses,
        "evaluations": evaluations,
        "decision": decision,
    }

    if not os.path.exists(LOG_FILE):
        with open(LOG_FILE, "w") as f:
            json.dump([entry], f, indent=2)
    else:
        with open(LOG_FILE, "r") as f:
            existing = json.load(f)
        existing.append(entry)
        with open(LOG_FILE, "w") as f:
            json.dump(existing, f, indent=2)
    logger.info(f"[debate_log] Debate entry logged.")

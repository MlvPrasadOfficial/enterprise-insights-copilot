import json
from collections import Counter
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("debate_leaderboard")

try:
    with open("logs/debate_log.json") as f:
        logs = json.load(f)
    wins = [eval(entry["decision"]).get("winner") for entry in logs]
    win_count = Counter(wins)
    logger.info("\n📊 Multi-Agent Win Leaderboard:")
    for agent, count in win_count.most_common():
        logger.info(f"{agent}: {count} wins")
except Exception as e:
    logger.error(f"Exception in debate_leaderboard: {e}")
    raise

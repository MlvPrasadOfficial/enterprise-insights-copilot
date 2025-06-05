import json
from collections import Counter

with open("logs/debate_log.json") as f:
    logs = json.load(f)

wins = [eval(entry["decision"]).get("winner") for entry in logs]
win_count = Counter(wins)

print("\n📊 Multi-Agent Win Leaderboard:")
for agent, count in win_count.most_common():
    print(f"{agent}: {count} wins")

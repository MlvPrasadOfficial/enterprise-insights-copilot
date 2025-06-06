import pandas as pd
from backend.agents.debate_agent import DebateAgent
from backend.core.session_memory import memory
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s %(message)s')
logger = logging.getLogger("eval_runner")

try:
    # Load your real test DataFrame here (replace with your actual data path)
    df = pd.read_csv("path_to_test_dataset.csv")
    memory.update(df, "eval_data")

    eval_set = pd.read_csv("eval/eval_set.csv")
    results = []

    agent = DebateAgent(df)

    # agent 

    for i, row in eval_set.iterrows():
        query = row["query"]
        expected_type = row["expected_type"]
        expected_keywords = [x.strip() for x in row["expected_keywords"].split(",")]

        logger.info(f"Running debate for query: {query}")

        result = agent.run_debate(query)
        final = result["decision"]
        responses = result["responses"]

        best_response = final.get("corrected", responses.get(final["winner"], ""))
        matched_keywords = [k for k in expected_keywords if k.lower() in best_response.lower()]
        score = "pass" if len(matched_keywords) >= len(expected_keywords) * 0.6 else "fail"

        results.append({
            "query": query,
            "winner": final["winner"],
            "keywords_matched": matched_keywords,
            "score": score,
            "reason": final["reason"]
        })

    pd.DataFrame(results).to_csv("logs/eval_results.csv", index=False)
    logger.info("Evaluation complete. Results saved to logs/eval_results.csv")
except Exception as e:
    logger.error(f"Exception in eval_runner: {e}")
    raise

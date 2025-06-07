"""
Test the /multiagent-query endpoint using eval/eval_set.csv for automated multi-agent evaluation.

Example row from eval_set.csv:
ID,Name,Age,Gender,Department,Joining_Date,Salary,City,Performance_Score,Status
1,Alice,29,F,HR,2020-01-15,50000,New York,85,Active
This test will generate queries like:
  "Show details for employee Alice in HR department."
for each row in the CSV and send them to the /multiagent-query endpoint.
The endpoint should return a structured multi-agent result for each query.

To run:
  pytest tests/agentic/test_multiagent_eval.py
Ensure the backend is running and eval/eval_set.csv is present.
"""
import os
import pandas as pd
import requests
import time

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000/api/v1")
EVAL_CSV = os.path.join(os.path.dirname(__file__), "..", "..", "eval", "eval_set.csv")


def test_multiagent_eval():
    df = pd.read_csv(EVAL_CSV)
    session_id = "test-eval-session"
    results = []
    for i, row in df.iterrows():
        # Compose a natural language query for each row (example: ask about the employee)
        query = f"Show details for employee {row['Name']} in {row['Department']} department."
        payload = {"query": query, "session_id": session_id}
        resp = requests.post(f"{BACKEND_URL}/multiagent-query", json=payload)
        assert resp.status_code == 200, f"Failed for query: {query}"
        result = resp.json()
        print(f"Query: {query}\nResult: {result}\n{'-'*40}")
        results.append({"query": query, "result": result})
        time.sleep(0.5)  # avoid rate limits
    # Optionally: add assertions for expected output structure
    assert all("result" in r["result"] for r in results)

if __name__ == "__main__":
    test_multiagent_eval()

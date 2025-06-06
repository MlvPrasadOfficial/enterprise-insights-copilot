import os
from openai import OpenAI
from backend.core.logging import logger

openai_api_key = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=openai_api_key)

class CritiqueAgent:
    def __init__(self, data_columns: list):
        self.data_columns = data_columns
        logger.info(f"[CritiqueAgent] Initialized with columns: {data_columns}")

    def evaluate(self, query: str, answer: str) -> dict:
        logger.info(f"[CritiqueAgent] evaluate called with query: {query}")
        prompt = f"""
You are an LLM evaluation agent.

- Evaluate the following AI-generated answer for possible hallucinations or mistakes.
- Check if it references columns not present in the dataset.
- Estimate confidence level (High/Medium/Low) and add a short explanation.

Available Columns: {self.data_columns}
Original Query: {query}
AI Response:
{answer}

Evaluation (JSON format):
{{
  "confidence": "",
  "flagged": false,
  "issues": [],
  "advice": ""
}}
"""

        try:
            response = client.chat.completions.create(
                model="gpt-4",
                messages=[{"role": "user", "content": prompt}]
            )
            logger.info(f"[CritiqueAgent] OpenAI response received.")
            parsed = eval(response.choices[0].message.content.strip())
            return parsed
        except Exception as e:
            logger.error(f"[CritiqueAgent] Exception: {e}")
            return {
                "confidence": "Low",
                "flagged": True,
                "issues": ["Evaluation failed to parse"],
                "advice": "Check response manually"
            }

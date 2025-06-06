import os
import json
from openai import OpenAI
from backend.core.logging import logger
from typing import List, Dict, Any

openai_api_key = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=openai_api_key)

"""
CritiqueAgent: Evaluates LLM answers for correctness, hallucinations, and dataset relevance.
Adds confidence, flags, and advice using OpenAI GPT-4.
"""


class CritiqueAgent:
    def __init__(self, data_columns: List[str]):
        """
        Initialize CritiqueAgent with dataset columns.
        Args:
            data_columns (List[str]): List of column names in the dataset.
        """
        self.data_columns = data_columns
        logger.info(f"[CritiqueAgent] Initialized with columns: {data_columns}")

    def evaluate(self, query: str, answer: str) -> Dict[str, Any]:
        """
        Evaluate an LLM answer for hallucinations, mistakes, and dataset relevance.
        Args:
            query (str): The user's original query.
            answer (str): The LLM's answer to evaluate.
        Returns:
            Dict[str, Any]: Evaluation result with confidence, flags, issues, and advice.
        """
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
                model="gpt-4", messages=[{"role": "user", "content": prompt}]
            )
            logger.info(f"[CritiqueAgent] OpenAI response received.")
            content = response.choices[0].message.content.strip()
            # Remove code block markers if present
            if content.startswith("```"):
                content = content.strip("`\n")
                if content.startswith("json"):
                    content = content[4:].strip()
            parsed = json.loads(content)
            return parsed
        except Exception as e:
            logger.error(f"[CritiqueAgent] Exception: {e}")
            return {
                "confidence": "Low",
                "flagged": True,
                "issues": ["Evaluation failed to parse"],
                "advice": "Check response manually",
            }

    @staticmethod
    def critique(analysis: Any) -> dict:
        """
        Critique the analysis result (stub for agentic flow).
        Args:
            analysis (Any): The analysis result to critique.
        Returns:
            dict: Critique result (stubbed as dict).
        """
        # TODO: Implement real critique logic (e.g., LLM evaluation)
        return {"critique": "[CritiqueAgent] Critique result (stub)"}

from backend.agents.base_agent import BaseAgent
from typing import List, Dict, Any
import os
import json
from openai import OpenAI
from backend.core.logging import logger
from config.agent_config import AgentConfig
from config.constants import VERBOSE

openai_api_key = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=openai_api_key)


class CritiqueAgent(BaseAgent):
    name = "CritiqueAgent"
    description = "Evaluates LLM answers for correctness, hallucinations, and dataset relevance."
    config: AgentConfig = AgentConfig(
        name="critic",
        description="Evaluates LLM answers for correctness, hallucinations, and dataset relevance.",
        enabled=True,
        model=None,
        temperature=None,
        max_tokens=None,
    )

    def __init__(self, data_columns: List[str]):
        """
        Initialize CritiqueAgent with dataset columns.
        Args:
            data_columns (List[str]): List of column names in the dataset.
        """
        self.data_columns = data_columns
        logger.info(f"[CritiqueAgent] Initialized with columns: {data_columns}")

    def run(self, query: str, data: Any, context=None, answer: str = None, **kwargs) -> Dict[str, Any]:
        if VERBOSE:
            print(f"[CritiqueAgent] Running with config: {self.config}")
        """
        Evaluate an LLM answer for hallucinations, mistakes, and dataset relevance.
        Args:
            query (str): The user's original query.
            answer (str): The LLM's answer to evaluate.
        Returns:
            Dict[str, Any]: Evaluation result with confidence, flags, issues, and advice.
        """
        logger.info(f"[CritiqueAgent] run called with query: {query}")
        available_columns = None
        if context and answer is None:
            sql_agent_output = context.get("SQLAgent", {})
            answer = sql_agent_output.get("output", None)
            available_columns = sql_agent_output.get("available_columns", None)
        # Summarize the data for the LLM to check against
        data_summary = ""
        try:
            import pandas as pd
            if isinstance(data, pd.DataFrame):
                # Show only the relevant columns and top 5 rows for context
                data_summary = data.head(5).to_markdown()
            elif isinstance(data, list) and len(data) > 0 and isinstance(data[0], dict):
                import pandas as pd
                df = pd.DataFrame(data)
                data_summary = df.head(5).to_markdown()
        except Exception as e:
            logger.warning(f"[CritiqueAgent] Could not summarize data for prompt: {e}")
            data_summary = str(data)[:500]
        prompt = f"""
You are an LLM evaluation agent.

- Evaluate the following AI-generated answer for possible hallucinations or mistakes.
- Check if it references columns not present in the dataset.
- Check if the answer matches the actual data provided below. Only flag as hallucination if the answer does not match the data.
- Estimate confidence level (High/Medium/Low) and add a short explanation.

Available Columns: {self.data_columns}
Original Query: {query}
AI Response:
{answer}

Data (first 5 rows):
{data_summary}

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
            logger.info(f"[CritiqueAgent] Evaluation result: {parsed}")
            # If available_columns is present, append to advice
            if available_columns:
                advice = parsed.get("advice", "")
                advice += f"\nAvailable columns in your data: {available_columns}"
                parsed["advice"] = advice
            result = {
                "agent": self.name,
                "description": self.description,
                "output": parsed,
                "config": self.config.__dict__,
            }
            return result
        except Exception as e:
            logger.error(f"[CritiqueAgent] Exception: {e}")
            advice = "Check response manually"
            if available_columns:
                advice += f"\nAvailable columns in your data: {available_columns}"
            return {
                "agent": self.name,
                "description": self.description,
                "output": {
                    "confidence": "Low",
                    "flagged": True,
                    "issues": ["Evaluation failed to parse"],
                    "advice": advice,
                }
            }

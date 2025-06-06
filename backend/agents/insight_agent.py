import pandas as pd
import json
import os
from openai import OpenAI
from config.settings import load_prompt
from langsmith import traceable
from backend.core.logging import logger

openai_api_key = os.getenv("OPENAI_API_KEY")

class InsightAgent:
    def __init__(self, df: pd.DataFrame):
        self.df = df
        logger.info(f"[InsightAgent] Initialized with DataFrame shape: {df.shape}")

    @traceable(name="generate_insights")
    def generate_summary(self):
        logger.info("[InsightAgent] generate_summary called.")
        try:
            # Prepare a profiling summary of the data
            profile = {
                "columns": list(self.df.columns),
                "shape": self.df.shape,
                "summary_stats": self.df.describe().to_dict(),
                "missing": self.df.isnull().sum().to_dict()
            }

            template = load_prompt("config/prompts/insight_prompt.txt")
            prompt = template.format(profile=json.dumps(profile, indent=2))

            client = OpenAI(api_key=openai_api_key)
            logger.info(f"[InsightAgent] Prompt sent to OpenAI.")
            response = client.chat.completions.create(
                model="gpt-4",
                messages=[{"role": "user", "content": prompt}]
            )
            logger.info(f"[InsightAgent] OpenAI response received.")
            return response.choices[0].message.content.strip()
        except Exception as e:
            logger.error(f"[InsightAgent] Exception: {e}")
            raise

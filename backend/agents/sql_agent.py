import pandas as pd
import duckdb
from openai import OpenAI
import os
from config.settings import load_prompt
from backend.core.logging import logger

openai_api_key = os.getenv("OPENAI_API_KEY")

class SQLAgent:
    def __init__(self, df: pd.DataFrame):
        self.df = df
        logger.info(f"[SQLAgent] Initialized with DataFrame shape: {df.shape}")

    def generate_sql(self, user_query: str) -> str:
        logger.info(f"[SQLAgent] generate_sql called with user_query: {user_query}")
        # Convert DataFrame to a SQL table named 'df'
        columns = ", ".join([f"{col} ({dtype})" for col, dtype in zip(self.df.columns, self.df.dtypes)])
        schema_str = f"Table schema: {columns}"

        template = load_prompt("config/prompts/sql_prompt.txt")
        prompt = template.format(schema=schema_str, query=user_query)

        client = OpenAI(api_key=openai_api_key)
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}]
        )
        logger.info(f"[SQLAgent] Generated SQL: {response.choices[0].message.content.strip().split('```', 1)[0]}")
        return response.choices[0].message.content.strip().split("```", 1)[0]

    def run_sql(self, query: str):
        logger.info(f"[SQLAgent] run_sql called with query: {query}")
        try:
            con = duckdb.connect()
            con.register("df", self.df)
            result = con.execute(query).fetchdf()
            logger.info(f"[SQLAgent] SQL executed successfully. Result shape: {result.shape}")
            return result
        except Exception as e:
            logger.error(f"[SQLAgent] SQL execution failed: {e}")
            raise

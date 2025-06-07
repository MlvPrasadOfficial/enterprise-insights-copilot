"""
SQLAgent: Generates and executes SQL queries on a DataFrame using LLMs and DuckDB.
"""

from backend.agentic.base_agent import BaseAgent
import pandas as pd
import duckdb
from openai import OpenAI
import os
from config.settings import load_prompt
from backend.core.logging import logger
from typing import Any, Dict
import re
from config.agent_config import AgentConfig
from config.constants import VERBOSE

openai_api_key = os.getenv("OPENAI_API_KEY")


class SQLAgent(BaseAgent):
    name = "SQLAgent"
    description = "Generates and executes SQL queries on a DataFrame."
    config: AgentConfig = AgentConfig(
        name="analyst",
        description="Generates and executes SQL queries on a DataFrame.",
        enabled=True,
        model=None,
        temperature=None,
        max_tokens=None,
    )

    def __init__(self, df: pd.DataFrame):
        """
        Initialize SQLAgent with a DataFrame.
        Args:
            df (pd.DataFrame): The DataFrame to query.
        """
        self.df = df
        logger.info(f"[SQLAgent] Initialized with DataFrame shape: {df.shape}")

    def generate_sql(self, user_query: str) -> str:
        """
        Generate a SQL query from a natural language user query using LLM.
        Args:
            user_query (str): The user's question in natural language.
        Returns:
            str: The generated SQL query.
        """
        logger.info(f"[SQLAgent] generate_sql called with user_query: {user_query}")
        # Convert DataFrame to a SQL table named 'df'
        columns = ", ".join(
            [f"{col} ({dtype})" for col, dtype in zip(self.df.columns, self.df.dtypes)]
        )
        schema_str = f"Table schema: {columns}"

        template = load_prompt("config/prompts/sql_prompt.txt")
        prompt = template.format(schema=schema_str, query=user_query)

        client = OpenAI(api_key=openai_api_key)
        response = client.chat.completions.create(
            model="gpt-4", messages=[{"role": "user", "content": prompt}]
        )
        logger.info(
            f"[SQLAgent] Generated SQL: {response.choices[0].message.content.strip().split('```', 1)[0]}"
        )
        return response.choices[0].message.content.strip().split("```", 1)[0]

    def run_sql(self, query: str) -> pd.DataFrame:
        """
        Execute a SQL query on the DataFrame using DuckDB.
        Args:
            query (str): The SQL query to execute.
        Returns:
            pd.DataFrame: The result of the query as a DataFrame.
        Raises:
            Exception: If SQL execution fails.
        """
        logger.info(f"[SQLAgent] run_sql called with query: {query}")
        # Debug: print DataFrame columns before registering
        logger.info(f"[SQLAgent] DataFrame columns before DuckDB registration: {list(self.df.columns)}")
        # Ensure columns are stripped of whitespace
        self.df.columns = self.df.columns.str.strip()
        logger.info(f"[SQLAgent] DataFrame columns after strip: {list(self.df.columns)}")
        logger.info(f"[SQLAgent] DataFrame head before DuckDB registration:\n{self.df.head()}\n")
        try:
            con = duckdb.connect()
            con.register("df", self.df)
            result = con.execute(query).fetchdf()
            logger.info(
                f"[SQLAgent] SQL executed successfully. Result shape: {result.shape}"
            )
            return result
        except Exception as e:
            logger.error(f"[SQLAgent] SQL execution failed: {e}")
            raise

    @staticmethod
    def analyze(user_query: str, docs: Any, data: Any) -> str:
        """
        Analyze the user query and docs for the agentic flow (stub for now).
        Args:
            user_query (str): The user's question.
            docs (Any): Retrieved context (if any).
            data (Any): The data to analyze.
        Returns:
            str: Analysis result (stubbed as string).
        """
        # TODO: Implement real analysis logic (e.g., SQL, LLM, DataFrame ops)
        return "[SQLAgent] Analysis result (stub)"

    def extract_sql(self, text: str) -> str:
        """Extract SQL code from LLM output, handling code blocks and plain text."""
        match = re.search(r"```sql\s*(.*?)```", text, re.DOTALL | re.IGNORECASE)
        if match:
            return match.group(1).strip()
        # Fallback: take all lines from the first SELECT onward
        lines = text.strip().splitlines()
        sql_lines = []
        in_select = False
        for line in lines:
            if line.strip().lower().startswith("select"):
                in_select = True
            if in_select:
                sql_lines.append(line)
        if sql_lines:
            return "\n".join(sql_lines).strip()
        # Fallback: return None if not valid SQL
        return None

    def run(self, query: str, data: Any, context=None, **kwargs) -> Dict[str, Any]:
        """
        Execute the agent's logic: generate SQL from the query, run the SQL on the data,
        and return the structured result.
        Args:
            query (str): The user's question in natural language.
            data (pd.DataFrame): The DataFrame to query.
        Returns:
            Dict[str, Any]: Structured result containing agent name, role, and output.
        """
        if VERBOSE:
            print(f"[SQLAgent] Running with config: {self.config}")
        logger.info(f"[SQLAgent] run called with query: {query}, data shape: {data.shape}")
        self.df = data  # Update the DataFrame to the latest one provided
        sql_query = self.generate_sql(query)
        sql_query = self.extract_sql(sql_query)
        if not sql_query or not sql_query.lower().startswith("select"):
            logger.error(f"[SQLAgent] Invalid SQL generated: {sql_query}")
            return {
                "agent": self.name,
                "description": self.description,
                "output": "Failed to generate a valid SQL query. Please rephrase your question.",
                "available_columns": list(self.df.columns),
            }
        try:
            result_df = self.run_sql(sql_query)
            # Map categorical values for user-friendly output
            from backend.core.utils import map_categorical_values
            records = result_df.to_dict(orient="records")
            mapped_records = [map_categorical_values(r) for r in records]
            result = {
                "agent": self.name,
                "description": self.description,
                "output": mapped_records,
                "config": self.config.__dict__,
            }
            logger.info(f"[SQLAgent] run output: {result}")
            return result
        except Exception as e:
            logger.error(f"[SQLAgent] SQL execution failed: {e}")
            error_message = str(e)
            # Detect column not found error (DuckDB error message)
            if "Referenced column" in error_message and "not found" in error_message:
                return {
                    "agent": self.name,
                    "description": self.description,
                    "output": f"SQL execution error: {e}",
                    "available_columns": list(self.df.columns),
                }
            return {
                "agent": self.name,
                "description": self.description,
                "output": f"SQL execution error: {e}"
            }

"""
SQLAgent: Generates and executes SQL queries on a DataFrame using LLMs and DuckDB.
"""

from backend.agents.base_agent import BaseAgent, AgentConfig, AgentMetrics
import pandas as pd
import duckdb
from openai import OpenAI
import os
from config.settings import load_prompt
from backend.core.logging import logger
from typing import Any, Dict, Optional
import re
from config.constants import VERBOSE
from backend.core.tracing import traced

openai_api_key = os.getenv("OPENAI_API_KEY")


class SQLAgent(BaseAgent):
    name = "SQLAgent"
    role = "Generates and executes SQL queries on a DataFrame."

    def __init__(self, config=None):
        """
        Initialize SQLAgent with configuration.
        Args:
            config: Optional configuration dictionary.
        """
        super().__init__(config)
        self.df = None
        logger.info(f"[{self.name}] Initialized")
        
    def pre_process(self, query: str, data: Any, **kwargs) -> Dict[str, Any]:
        """
        Pre-processing hook executed before main logic.
        Args:
            query: The user's question
            data: The DataFrame to query
            **kwargs: Additional context
        Returns:
            Dict with preprocessing results
        """
        context = super().pre_process(query, data, **kwargs)
        # Store DataFrame reference
        self.df = data
        logger.info(f"[{self.name}] Pre-processing with DataFrame shape: {data.shape}")
        
        # Ensure columns are stripped of whitespace
        self.df.columns = self.df.columns.str.strip()
        logger.debug(f"[{self.name}] DataFrame columns after strip: {list(self.df.columns)}")
        
        return context

    @traced(name="sql_agent_execute")
    def _execute(self, query: str, data: pd.DataFrame, **kwargs) -> Dict[str, Any]:
        """
        Execute the agent's logic: generate SQL from the query, run the SQL on the data,
        and return the structured result.
        
        Args:
            query (str): The user's question in natural language.
            data (pd.DataFrame): The DataFrame to query.
            **kwargs: Additional parameters.
            
        Returns:
            Dict[str, Any]: Structured result containing SQL query, results and metadata.
        """
        try:
            # Generate SQL query from natural language
            sql_query = self.generate_sql(query)
            sql_query = self.extract_sql(sql_query)
            
            if not sql_query or not sql_query.lower().strip().startswith("select"):
                logger.error(f"[{self.name}] Invalid SQL generated: {sql_query}")
                return {
                    "sql_query": sql_query,
                    "error": "Failed to generate a valid SQL query",
                    "available_columns": list(self.df.columns),
                }
                
            # Execute the SQL query
            result_df = self.run_sql(sql_query)
            
            # Map categorical values for user-friendly output
            from backend.core.utils import map_categorical_values
            records = result_df.to_dict(orient="records")
            mapped_records = [map_categorical_values(r) for r in records]
            
            # Gather token usage statistics if available
            token_usage = kwargs.get("token_usage", {})
            if token_usage:
                self._metrics.token_usage = token_usage
                self._metrics.prompt_tokens = token_usage.get("prompt_tokens", 0)
                self._metrics.completion_tokens = token_usage.get("completion_tokens", 0)
                self._metrics.total_tokens = token_usage.get("total_tokens", 0)
                
            return {
                "sql_query": sql_query,
                "result": mapped_records,
                "result_shape": result_df.shape,
                "token_usage": token_usage
            }
            
        except Exception as e:
            logger.error(f"[{self.name}] Error in _execute: {str(e)}")
            # Use parent's error handling method to ensure consistent behavior
            error_result = {
                "sql_error": str(e),
                "available_columns": list(self.df.columns if self.df is not None else [])
            }
            return error_result

    def generate_sql(self, user_query: str) -> str:
        """
        Generate a SQL query from a natural language user query using LLM.
        Args:
            user_query (str): The user's question in natural language.
        Returns:
            str: The generated SQL query.
        """
        logger.info(f"[{self.name}] generate_sql called with user_query: {user_query}")
        
        # Convert DataFrame to a SQL table schema description
        columns = ", ".join(
            [f"{col} ({dtype})" for col, dtype in zip(self.df.columns, self.df.dtypes)]
        )
        schema_str = f"Table schema: {columns}"

        template = load_prompt("config/prompts/sql_prompt.txt")
        prompt = template.format(schema=schema_str, query=user_query)

        # Get token usage for metrics
        token_usage = {}
        
        try:
            client = OpenAI(api_key=openai_api_key)
            response = client.chat.completions.create(
                model=self.config.model,
                temperature=self.config.temperature,
                max_tokens=self.config.max_tokens,
                messages=[{"role": "user", "content": prompt}]
            )
            
            # Capture token usage for metrics
            if hasattr(response, "usage") and response.usage:
                token_usage = {
                    "prompt_tokens": response.usage.prompt_tokens,
                    "completion_tokens": response.usage.completion_tokens,
                    "total_tokens": response.usage.total_tokens
                }
            
            sql_result = response.choices[0].message.content.strip()
            logger.info(f"[{self.name}] Generated SQL: {sql_result[:100]}...")
            return sql_result
            
        except Exception as e:
            logger.error(f"[{self.name}] Error generating SQL: {str(e)}")
            raise

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
        logger.info(f"[{self.name}] run_sql called with query: {query}")
        
        try:
            con = duckdb.connect()
            con.register("df", self.df)
            result = con.execute(query).fetchdf()
            logger.info(
                f"[{self.name}] SQL executed successfully. Result shape: {result.shape}"
            )
            return result
        except Exception as e:
            logger.error(f"[{self.name}] SQL execution failed: {e}")
            # Enhance error message with available columns
            if "Referenced column" in str(e) and "not found" in str(e):
                err_msg = f"SQL execution error: {e}. Available columns: {list(self.df.columns)}"
                raise Exception(err_msg)
            raise

    def extract_sql(self, text: str) -> str:
        """
        Extract SQL code from LLM output, handling code blocks and plain text.
        
        Args:
            text (str): The LLM's response containing SQL.
            
        Returns:
            str: Extracted SQL query or None if not found.
        """
        # Try to find SQL in code blocks
        match = re.search(r"```sql\s*(.*?)```", text, re.DOTALL | re.IGNORECASE)
        if match:
            return match.group(1).strip()
            
        # Try to find SQL in any code block
        match = re.search(r"```\s*(.*?)```", text, re.DOTALL)
        if match:
            extracted = match.group(1).strip()
            if extracted.lower().startswith("select"):
                return extracted
                
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

    def analyze(self, user_query: str, data: pd.DataFrame) -> Dict[str, Any]:
        """
        Analyze the user query and data using SQL generation and execution.
        
        Args:
            user_query (str): The user's question.
            data (pd.DataFrame): The data to analyze.
            
        Returns:
            Dict[str, Any]: Analysis result including SQL and results.
        """
        return self.run(user_query, data)

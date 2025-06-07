from typing import Any, Dict
import pandas as pd

class BaseAgent:
    name: str = "BaseAgent"
    role: str = "Base agent for all specialized agents."

    def run(self, query: str, data: pd.DataFrame, **kwargs) -> Dict[str, Any]:
        """
        Run the agent on the given query and data.
        Args:
            query (str): The user's question.
            data (pd.DataFrame): The data to operate on.
        Returns:
            dict: Structured output with agent name, role, and result.
        """
        raise NotImplementedError("Each agent must implement its own run() method.")

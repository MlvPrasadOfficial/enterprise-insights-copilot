"""
DataAgent: Provides profiling, numeric summary, and schema inference for DataFrames.
"""

import pandas as pd
import json
from typing import Dict, Any
from backend.core.logging import logger

class DataAgent:
    def __init__(self, df: pd.DataFrame):
        """
        Initialize DataAgent with a DataFrame.
        Args:
            df (pd.DataFrame): The DataFrame to analyze.
        """
        self.df = df
        logger.info(f"[DataAgent] Initialized with DataFrame shape: {df.shape}")

    def profile(self) -> Dict[str, Any]:
        """
        Profile the DataFrame: columns, shape, dtypes, and missing values.
        Returns:
            Dict[str, Any]: Profiling information.
        """
        logger.info("[DataAgent] profile called.")
        return {
            "columns": list(self.df.columns),
            "shape": self.df.shape,
            "dtypes": self.df.dtypes.astype(str).to_dict(),
            "missing_values": self.df.isnull().sum().to_dict()
        }

    def summarize_numeric(self) -> Dict[str, Any]:
        """
        Summarize numeric columns in the DataFrame.
        Returns:
            Dict[str, Any]: Summary statistics for numeric columns.
        """
        logger.info("[DataAgent] summarize_numeric called.")
        return self.df.describe().to_dict()

    def infer_schema(self) -> str:
        """
        Infer the schema of the DataFrame as a JSON string.
        Returns:
            str: JSON string of column types.
        """
        logger.info("[DataAgent] infer_schema called.")
        return json.dumps(self.df.dtypes.astype(str).to_dict(), indent=2)

# --- Utility extraction candidates ---
# Consider moving profile, summarize_numeric, and infer_schema logic to backend/core/utils.py or a new services/dataframe_utils.py for modularity and reuse.

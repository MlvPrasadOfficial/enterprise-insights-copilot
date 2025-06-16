"""
DataAgent: Provides profiling, numeric summary, and schema inference for DataFrames.
"""

import pandas as pd
import json
from typing import Dict, Any, Optional, List
from backend.core.logging import logger
from backend.agents.base_agent import BaseAgent


class DataAgent(BaseAgent):
    name = "DataAgent"
    role = "Analyzes dataset structure, types, and statistics"

    def __init__(self, df: pd.DataFrame, config=None):
        """
        Initialize DataAgent with a DataFrame.
        Args:
            df (pd.DataFrame): The DataFrame to analyze.
            config: Optional configuration
        """
        super().__init__(config)
        self.df = df
        logger.info(f"[{self.name}] Initialized with DataFrame shape: {df.shape}")

    def _execute(self, query: str, data: pd.DataFrame, **kwargs) -> Dict[str, Any]:
        """
        Execute data analysis based on the query.
        Args:
            query: The user's question
            data: The DataFrame to analyze
            **kwargs: Additional context parameters
        Returns:
            Dict with analysis results
        """
        # Update dataframe if provided in the call
        if data is not None and not data.empty:
            self.df = data

        # Determine what analysis to perform based on the query
        if "schema" in query.lower() or "structure" in query.lower():
            result = self.infer_schema()
        elif "numeric" in query.lower() or "statistics" in query.lower():
            result = self.summarize_numeric()
        else:
            # Default to full profile
            result = self.profile()

        return {
            "analysis_type": "data_profiling",
            "result": result,
        }

    def profile(self) -> Dict[str, Any]:
        """
        Profile the DataFrame: columns, shape, dtypes, and missing values.
        Returns:
            Dict[str, Any]: Profiling information.
        """
        logger.info("[DataAgent] profile called.")
        try:
            # Handle empty DataFrame
            if self.df is None or self.df.empty:
                return {
                    "error": "DataFrame is empty or None",
                    "columns": [],
                    "shape": (0, 0),
                    "dtypes": {},
                    "missing_values": {},
                }

            # Basic profiling
            profile_data = {
                "columns": list(self.df.columns),
                "shape": self.df.shape,
                "dtypes": self.df.dtypes.astype(str).to_dict(),
                "missing_values": self.df.isnull().sum().to_dict(),
            }

            # Add sample data for preview
            profile_data["sample"] = self.df.head(5).to_dict(orient="records")

            # Add memory usage
            profile_data["memory_usage"] = {
                "total_bytes": self.df.memory_usage(deep=True).sum(),
                "per_column": self.df.memory_usage(deep=True).to_dict(),
            }

            return profile_data

        except Exception as e:
            logger.error(f"[DataAgent] Error in profile: {str(e)}")
            return {"error": f"Profile failed: {str(e)}"}

    def summarize_numeric(self) -> Dict[str, Any]:
        """
        Summarize numeric columns in the DataFrame.
        Returns:
            Dict[str, Any]: Summary statistics for numeric columns.
        """
        logger.info("[DataAgent] summarize_numeric called.")
        try:
            # Handle empty DataFrame
            if self.df is None or self.df.empty:
                return {"error": "DataFrame is empty or None", "summary": {}}

            # Get summary statistics
            numeric_summary = self.df.describe().to_dict()

            # For large datasets, sample for additional statistics
            if len(self.df) > 10000:
                sample_df = self.df.sample(n=10000, random_state=42)
                logger.info(f"[DataAgent] Using sample of 10000 rows for extended statistics")
            else:
                sample_df = self.df

            # Add correlation matrix for numeric columns
            try:
                numeric_cols = sample_df.select_dtypes(include=["number"]).columns
                if len(numeric_cols) > 1:
                    correlation = sample_df[numeric_cols].corr().to_dict()
                    numeric_summary["correlation"] = correlation
            except Exception as e:
                logger.warning(f"[DataAgent] Could not compute correlation: {str(e)}")

            return numeric_summary

        except Exception as e:
            logger.error(f"[DataAgent] Error in summarize_numeric: {str(e)}")
            return {"error": f"Numeric summary failed: {str(e)}"}

    def infer_schema(self) -> Dict[str, Any]:
        """
        Infer the schema of the DataFrame with detailed type information.
        Returns:
            Dict with column types and additional schema information
        """
        logger.info("[DataAgent] infer_schema called.")
        try:
            # Handle empty DataFrame
            if self.df is None or self.df.empty:
                return {"error": "DataFrame is empty or None", "schema": {}}

            schema = {}

            # Basic types
            schema["column_types"] = self.df.dtypes.astype(str).to_dict()

            # Detailed type analysis
            schema["detailed_types"] = {}

            for col in self.df.columns:
                col_data = self.df[col]
                col_type = str(col_data.dtype)
                col_info = {
                    "dtype": col_type,
                    "unique_values": col_data.nunique(),
                    "is_unique": col_data.is_unique,
                    "has_nulls": col_data.isnull().any(),
                    "null_count": col_data.isnull().sum(),
                }

                # Add type-specific information
                if pd.api.types.is_numeric_dtype(col_data):
                    col_info["min"] = col_data.min() if not col_data.empty else None
                    col_info["max"] = col_data.max() if not col_data.empty else None
                elif pd.api.types.is_categorical_dtype(col_data) or pd.api.types.is_object_dtype(
                    col_data
                ):
                    # Get top 5 most common values
                    try:
                        top_values = col_data.value_counts().head(5).to_dict()
                        col_info["top_values"] = top_values
                    except:
                        pass
                elif pd.api.types.is_datetime64_any_dtype(col_data):
                    col_info["min_date"] = col_data.min() if not col_data.empty else None
                    col_info["max_date"] = col_data.max() if not col_data.empty else None

                schema["detailed_types"][col] = col_info

            return schema

        except Exception as e:
            logger.error(f"[DataAgent] Error in infer_schema: {str(e)}")
            return {"error": f"Schema inference failed: {str(e)}"}

    def detect_column_types(self) -> Dict[str, List[str]]:
        """
        Detect and categorize columns by their functional types.
        Returns:
            Dict mapping types to lists of column names
        """
        try:
            categories = {
                "numeric": [],
                "categorical": [],
                "datetime": [],
                "text": [],
                "boolean": [],
                "id": [],
                "unknown": [],
            }

            for col in self.df.columns:
                col_data = self.df[col]

                if pd.api.types.is_numeric_dtype(col_data):
                    categories["numeric"].append(col)
                elif pd.api.types.is_datetime64_any_dtype(col_data):
                    categories["datetime"].append(col)
                elif pd.api.types.is_bool_dtype(col_data):
                    categories["boolean"].append(col)
                elif pd.api.types.is_categorical_dtype(col_data):
                    categories["categorical"].append(col)
                elif pd.api.types.is_object_dtype(col_data):
                    # Check if it's likely an ID column
                    if col.lower().endswith("id") or col.lower() == "id":
                        categories["id"].append(col)
                    # Check if it's likely text
                    elif col_data.str.len().mean() > 20:
                        categories["text"].append(col)
                    # Otherwise assume categorical
                    else:
                        categories["categorical"].append(col)
                else:
                    categories["unknown"].append(col)

            return categories

        except Exception as e:
            logger.error(f"[DataAgent] Error in detect_column_types: {str(e)}")
            return {"error": f"Column type detection failed: {str(e)}"}

# Consider moving utility functions to backend/core/utils.py or a new services/dataframe_utils.py as suggested

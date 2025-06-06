import pandas as pd
import re
from backend.core.logging import logger
from typing import Any


class DataCleanerAgent:
    def __init__(self, df: pd.DataFrame):
        """
        Initialize the DataCleanerAgent with a DataFrame.
        Args:
            df (pd.DataFrame): The data to clean.
        """
        self.df = df.copy()
        logger.info(f"[DataCleanerAgent] Initialized with DataFrame shape: {df.shape}")

    def normalize_units(self) -> pd.DataFrame:
        """
        Normalize units in string columns (e.g., kg, lbs, currency).
        Returns:
            pd.DataFrame: The DataFrame with normalized units.
        """
        logger.info("[DataCleanerAgent] normalize_units called.")
        for col in self.df.columns:
            if self.df[col].dtype == "object":
                self.df[col] = self.df[col].apply(self._standardize_unit)
        logger.info("[DataCleanerAgent] normalize_units completed.")
        return self.df

    def _standardize_unit(self, val: Any) -> Any:
        """
        Standardize a single value for units and currency.
        Args:
            val (Any): The value to standardize.
        Returns:
            Any: The standardized value.
        """
        if not isinstance(val, str):
            return val

        val = val.strip().lower()

        # Weight normalization
        if "kg" in val:
            try:
                return round(float(val.replace("kg", "").strip()), 2)
            except:
                logger.error(f"[DataCleanerAgent] Error normalizing weight: {val}")
                return val
        elif "lb" in val or "lbs" in val:
            try:
                lbs = float(re.sub("[^0-9.]", "", val))
                return round(lbs * 0.453592, 2)
            except:
                logger.error(f"[DataCleanerAgent] Error normalizing weight: {val}")
                return val

        # Currency normalization
        if "₹" in val or "$" in val or "€" in val:
            val = re.sub(r"[₹$€,]", "", val)
            try:
                return float(val)
            except:
                logger.error(f"[DataCleanerAgent] Error normalizing currency: {val}")
                return val

        return val

    def fix_numerics(self) -> pd.DataFrame:
        """
        Attempt to convert object columns to numeric types where possible.
        Returns:
            pd.DataFrame: The DataFrame with fixed numerics.
        """
        logger.info("[DataCleanerAgent] fix_numerics called.")
        for col in self.df.columns:
            if self.df[col].dtype == "object":
                try:
                    self.df[col] = pd.to_numeric(self.df[col], errors="ignore")
                except:
                    logger.error(
                        f"[DataCleanerAgent] Error fixing numerics in column {col}."
                    )
                    pass
        logger.info("[DataCleanerAgent] fix_numerics completed.")
        return self.df

    def clean(self) -> pd.DataFrame:
        """
        Clean the DataFrame by normalizing units and fixing numerics.
        Returns:
            pd.DataFrame: The cleaned DataFrame.
        """
        logger.info("[DataCleanerAgent] clean called.")
        self.normalize_units()
        self.fix_numerics()
        logger.info("[DataCleanerAgent] Data cleaned.")
        return self.df

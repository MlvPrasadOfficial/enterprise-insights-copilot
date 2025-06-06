import pandas as pd
import json
from backend.core.logging import logger

class DataAgent:
    def __init__(self, df: pd.DataFrame):
        self.df = df
        logger.info(f"[DataAgent] Initialized with DataFrame shape: {df.shape}")

    def profile(self):
        logger.info("[DataAgent] profile called.")
        return {
            "columns": list(self.df.columns),
            "shape": self.df.shape,
            "dtypes": self.df.dtypes.astype(str).to_dict(),
            "missing_values": self.df.isnull().sum().to_dict()
        }

    def summarize_numeric(self):
        logger.info("[DataAgent] summarize_numeric called.")
        return self.df.describe().to_dict()

    def infer_schema(self):
        logger.info("[DataAgent] infer_schema called.")
        return json.dumps(self.df.dtypes.astype(str).to_dict(), indent=2)

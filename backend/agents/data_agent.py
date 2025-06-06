import pandas as pd
import json
from backend.core.logging import logger

class DataAgent:
    def __init__(self, df: pd.DataFrame):
        self.df = df

    def profile(self):
        return {
            "columns": list(self.df.columns),
            "shape": self.df.shape,
            "dtypes": self.df.dtypes.astype(str).to_dict(),
            "missing_values": self.df.isnull().sum().to_dict()
        }

    def summarize_numeric(self):
        return self.df.describe().to_dict()

    def infer_schema(self):
        return json.dumps(self.df.dtypes.astype(str).to_dict(), indent=2)

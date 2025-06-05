import pandas as pd
import re

class DataCleanerAgent:
    def __init__(self, df: pd.DataFrame):
        self.df = df.copy()

    def normalize_units(self):
        for col in self.df.columns:
            if self.df[col].dtype == "object":
                self.df[col] = self.df[col].apply(self._standardize_unit)
        return self.df

    def _standardize_unit(self, val):
        if not isinstance(val, str): return val

        val = val.strip().lower()

        # Weight normalization
        if "kg" in val:
            try:
                return round(float(val.replace("kg", "").strip()), 2)
            except: return val
        elif "lb" in val or "lbs" in val:
            try:
                lbs = float(re.sub("[^0-9.]", "", val))
                return round(lbs * 0.453592, 2)
            except: return val

        # Currency normalization
        if "₹" in val or "$" in val or "€" in val:
            val = re.sub(r"[₹$€,]", "", val)
            try:
                return float(val)
            except: return val

        return val

    def fix_numerics(self):
        for col in self.df.columns:
            if self.df[col].dtype == "object":
                try:
                    self.df[col] = pd.to_numeric(self.df[col], errors="ignore")
                except: pass
        return self.df

    def clean(self):
        self.normalize_units()
        self.fix_numerics()
        return self.df

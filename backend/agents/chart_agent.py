import pandas as pd
import altair as alt
from backend.core.logging import logger

class ChartAgent:
    def __init__(self, df: pd.DataFrame):
        self.df = df
        logger.info(f"[ChartAgent] Initialized with DataFrame shape: {df.shape}")

    def guess_chart(self, query: str):
        logger.info(f"[ChartAgent] guess_chart called with query: {query}")
        query = query.lower()
        if "trend" in query or "over time" in query:
            return "line"
        if "compare" in query or "category" in query:
            return "bar"
        if "distribution" in query:
            return "hist"
        if "correlation" in query or "relationship" in query:
            return "scatter"
        if "proportion" in query or "share" in query:
            return "pie"
        return "table"

    def render_chart(self, x: str, y: str, chart_type: str = "line"):
        logger.info(f"[ChartAgent] render_chart called with x={x}, y={y}, chart_type={chart_type}")
        if chart_type == "line":
            return alt.Chart(self.df).mark_line().encode(x=x, y=y)
        elif chart_type == "bar":
            return alt.Chart(self.df).mark_bar().encode(x=x, y=y)
        elif chart_type == "scatter":
            return alt.Chart(self.df).mark_circle().encode(x=x, y=y)
        elif chart_type == "hist":
            return alt.Chart(self.df).mark_bar().encode(
                alt.X(x, bin=True), y='count()'
            )
        else:
            return alt.Chart(self.df).mark_text().encode(text=x)

    def guess_axes(self):
        logger.info("[ChartAgent] guess_axes called.")
        numeric_cols = self.df.select_dtypes(include=["float", "int"]).columns.tolist()
        non_numeric_cols = self.df.select_dtypes(exclude=["float", "int"]).columns.tolist()

        x = non_numeric_cols[0] if non_numeric_cols else self.df.columns[0]
        y = numeric_cols[0] if numeric_cols else self.df.columns[1]
        return x, y
